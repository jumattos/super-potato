const SAVE_KEY = "super-potato-ranch-save-v2";
const TICK_SECONDS = 0.2;

const heroNames = ["Spudnik", "Tater Swift", "Mash Gordon", "Yam Solo", "Chip", "Russet"];
const heroClasses = [
  { name: "Mash Mage", icon: "✦", color: "plum" },
  { name: "Spud Scout", icon: "➶", color: "green" },
  { name: "Tuber Tank", icon: "◆", color: "blue" },
  { name: "Fry Fighter", icon: "⚔", color: "red" }
];
const quests = [
  { id: "meadow", name: "Meadow Patrol", description: "Chase crows away from the seed beds.", duration: 12, level: 1, coins: 8, seeds: 0 },
  { id: "rescue", name: "The Great Seed Rescue", description: "Recover a stolen sack from the creek.", duration: 20, level: 2, coins: 12, seeds: 1 },
  { id: "grub", name: "Golden Grub Hunt", description: "Track the legendary grub beyond the fence.", duration: 30, level: 3, coins: 24, seeds: 0 }
];

function createInitialState() {
  return {
    seeds: 3,
    potatoes: 0,
    coins: 0,
    clickGrowPower: 3,
    clickTrainPower: 4,
    plot: { planted: false, growth: 0 },
    training: { active: false, progress: 0, name: "" },
    roster: [],
    activeQuest: null,
    activity: ["The ranch gates are open. Plant your first potato!"]
  };
}

function loadState() {
  const initialState = createInitialState();
  const saved = localStorage.getItem(SAVE_KEY);

  if (!saved) {
    return initialState;
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      ...initialState,
      ...parsed,
      plot: { ...initialState.plot, ...parsed.plot },
      training: { ...initialState.training, ...parsed.training },
      roster: Array.isArray(parsed.roster) ? parsed.roster : [],
      activity: Array.isArray(parsed.activity) ? parsed.activity.slice(0, 5) : initialState.activity
    };
  } catch (error) {
    console.error("Could not load the ranch save.", error);
    return initialState;
  }
}

const state = loadState();
let lastSavedAt = Date.now();

const ui = {
  seeds: document.getElementById("seeds"),
  potatoes: document.getElementById("potatoes"),
  heroes: document.getElementById("heroes"),
  coins: document.getElementById("coins"),
  ranchLevel: document.getElementById("ranchLevel"),
  rankName: document.getElementById("rankName"),
  rankProgress: document.getElementById("rankProgress"),
  growthBar: document.getElementById("growthBar"),
  growthLabel: document.getElementById("growthLabel"),
  trainingBar: document.getElementById("trainingBar"),
  trainingLabel: document.getElementById("trainingLabel"),
  plotStatus: document.getElementById("plotStatus"),
  trainingStatus: document.getElementById("trainingStatus"),
  farmSprite: document.getElementById("farmSprite"),
  academySprite: document.getElementById("academySprite"),
  plantBtn: document.getElementById("plantBtn"),
  clickGrowBtn: document.getElementById("clickGrowBtn"),
  harvestBtn: document.getElementById("harvestBtn"),
  startTrainingBtn: document.getElementById("startTrainingBtn"),
  cheerBtn: document.getElementById("cheerBtn"),
  buySeedBtn: document.getElementById("buySeedBtn"),
  availableHeroes: document.getElementById("availableHeroes"),
  heroRoster: document.getElementById("heroRoster"),
  emptyRoster: document.getElementById("emptyRoster"),
  heroSelect: document.getElementById("heroSelect"),
  questList: document.getElementById("questList"),
  activeQuest: document.getElementById("activeQuest"),
  activeQuestName: document.getElementById("activeQuestName"),
  questTimer: document.getElementById("questTimer"),
  questBar: document.getElementById("questBar"),
  activityLog: document.getElementById("activityLog")
};

function ranchLevel() {
  return Math.floor(state.roster.length / 3) + 1;
}

function rankName(level) {
  return ["Sprout Ranch", "Tater Outpost", "Hero Homestead", "Legendary Ranch"][Math.min(level - 1, 3)];
}

function addActivity(message) {
  state.activity.unshift(message);
  state.activity = state.activity.slice(0, 5);
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  lastSavedAt = Date.now();
}

function setSpriteState(spriteElement, stateName) {
  spriteElement.classList.remove("seed", "sprout", "grown", "ready", "hero");
  spriteElement.classList.add(stateName);
}

function updateFarm() {
  if (!state.plot.planted) {
    setSpriteState(ui.farmSprite, "seed");
    ui.farmSprite.style.visibility = "hidden";
    ui.plotStatus.textContent = "Your plot is empty. Plant a potato!";
    return;
  }

  ui.farmSprite.style.visibility = "visible";

  if (state.plot.growth < 35) {
    setSpriteState(ui.farmSprite, "sprout");
    ui.plotStatus.textContent = "Tiny sprout! Give it water and sunshine.";
  } else if (state.plot.growth < 85) {
    setSpriteState(ui.farmSprite, "grown");
    ui.plotStatus.textContent = "Your super potato is getting chunky.";
  } else if (state.plot.growth < 100) {
    setSpriteState(ui.farmSprite, "ready");
    ui.plotStatus.textContent = "Nearly there. One last growing push!";
  } else {
    setSpriteState(ui.farmSprite, "ready");
    ui.plotStatus.textContent = "Ready to harvest!";
  }
}

function updateTraining() {
  if (!state.training.active) {
    ui.academySprite.style.visibility = "hidden";
    ui.trainingStatus.textContent = "No trainee yet. Harvest a potato first.";
    return;
  }

  ui.academySprite.style.visibility = "visible";
  setSpriteState(ui.academySprite, "hero");
  ui.trainingStatus.textContent = `${state.training.name} is training hard. Keep cheering!`;
}

function heroCard(hero) {
  const mission = hero.status === "quest" ? quests.find((quest) => quest.id === state.activeQuest?.questId) : null;
  const status = mission ? `On ${mission.name}` : "Rested and ready";

  return `
    <article class="hero-card ${hero.color}">
      <div class="hero-portrait" aria-hidden="true"><span>${hero.icon}</span></div>
      <div>
        <strong>${hero.name}</strong>
        <span>${hero.className}</span>
        <small>${status} · ${hero.missions} mission${hero.missions === 1 ? "" : "s"}</small>
      </div>
    </article>`;
}

function updateRoster() {
  const available = state.roster.filter((hero) => hero.status === "ready");
  ui.availableHeroes.textContent = `${available.length} READY`;
  ui.emptyRoster.hidden = state.roster.length > 0;
  ui.heroRoster.innerHTML = state.roster.map(heroCard).join("");

  const selectedHeroId = Number(ui.heroSelect.value);
  ui.heroSelect.innerHTML = available.length
    ? available.map((hero) => `<option value="${hero.id}">${hero.name} · ${hero.className}</option>`).join("")
    : '<option value="">No heroes available</option>';

  if (available.some((hero) => hero.id === selectedHeroId)) {
    ui.heroSelect.value = String(selectedHeroId);
  }

  ui.heroSelect.disabled = available.length === 0 || Boolean(state.activeQuest);
}

function updateQuests(level) {
  ui.questList.innerHTML = quests.map((quest) => {
    const locked = level < quest.level;
    const disabled = locked || Boolean(state.activeQuest) || !state.roster.some((hero) => hero.status === "ready");
    const reward = `${quest.coins} coins${quest.seeds ? ` + ${quest.seeds} seed` : ""}`;

    return `
      <article class="quest-card ${locked ? "locked" : ""}">
        <div>
          <strong>${locked ? "🔒 " : ""}${quest.name}</strong>
          <p>${quest.description}</p>
          <small>${quest.duration}s · ${reward}</small>
        </div>
        <button type="button" data-quest="${quest.id}" ${disabled ? "disabled" : ""}>
          ${locked ? `Level ${quest.level}` : "Dispatch"}
        </button>
      </article>`;
  }).join("");

  if (!state.activeQuest) {
    ui.activeQuest.hidden = true;
    return;
  }

  const quest = quests.find((item) => item.id === state.activeQuest.questId);
  const hero = state.roster.find((item) => item.id === state.activeQuest.heroId);
  const progress = ((quest.duration - state.activeQuest.remaining) / quest.duration) * 100;
  ui.activeQuest.hidden = false;
  ui.activeQuestName.textContent = `${hero.name} · ${quest.name}`;
  ui.questTimer.textContent = `${Math.ceil(state.activeQuest.remaining)}s`;
  ui.questBar.value = progress;
}

function updateJournal() {
  ui.activityLog.innerHTML = state.activity.map((entry) => `<li>${entry}</li>`).join("");
}

function updateUI() {
  const level = ranchLevel();
  const heroesUntilNextLevel = 3 - (state.roster.length % 3);

  ui.seeds.textContent = state.seeds;
  ui.potatoes.textContent = state.potatoes;
  ui.heroes.textContent = state.roster.length;
  ui.coins.textContent = state.coins;
  ui.ranchLevel.textContent = level;
  ui.rankName.textContent = rankName(level);
  ui.rankProgress.textContent = `${heroesUntilNextLevel} hero${heroesUntilNextLevel === 1 ? "" : "es"} until the next ranch level`;

  ui.growthBar.value = state.plot.growth;
  ui.growthLabel.textContent = `${Math.floor(state.plot.growth)}%`;
  ui.trainingBar.value = state.training.progress;
  ui.trainingLabel.textContent = `${Math.floor(state.training.progress)}%`;

  ui.plantBtn.disabled = state.plot.planted || state.seeds < 1;
  ui.clickGrowBtn.disabled = !state.plot.planted || state.plot.growth >= 100;
  ui.harvestBtn.disabled = !state.plot.planted || state.plot.growth < 100;
  ui.startTrainingBtn.disabled = state.training.active || state.potatoes < 1;
  ui.cheerBtn.disabled = !state.training.active;
  ui.buySeedBtn.disabled = state.coins < 4;
  ui.clickGrowBtn.textContent = `Water +${state.clickGrowPower}%`;
  ui.cheerBtn.textContent = `Cheer +${state.clickTrainPower}%`;

  updateFarm();
  updateTraining();
  updateRoster();
  updateQuests(level);
  updateJournal();
}

function plantPotato() {
  if (state.plot.planted || state.seeds < 1) {
    return;
  }

  state.seeds -= 1;
  state.plot.planted = true;
  state.plot.growth = 0;
  addActivity("A hopeful little seed went into Field 01.");
  saveGame();
  updateUI();
}

function clickGrow() {
  if (!state.plot.planted || state.plot.growth >= 100) {
    return;
  }

  state.plot.growth = Math.min(100, state.plot.growth + state.clickGrowPower);
  saveGame();
  updateUI();
}

function harvestPotato() {
  if (!state.plot.planted || state.plot.growth < 100) {
    return;
  }

  state.plot.planted = false;
  state.plot.growth = 0;
  state.potatoes += 1;
  const reward = 6 + ranchLevel();
  state.coins += reward;

  if (Math.random() < 0.45) {
    state.seeds += 1;
    addActivity(`Harvest complete! Earned ${reward} coins and found a bonus seed.`);
  } else {
    addActivity(`Harvest complete! Earned ${reward} coins.`);
  }

  saveGame();
  updateUI();
}

function startTraining() {
  if (state.training.active || state.potatoes < 1) {
    return;
  }

  state.potatoes -= 1;
  state.training.active = true;
  state.training.progress = 0;
  state.training.name = heroNames[state.roster.length % heroNames.length];
  addActivity(`${state.training.name} enrolled at the Hero Academy.`);
  saveGame();
  updateUI();
}

function cheerTrainee() {
  if (!state.training.active) {
    return;
  }

  state.training.progress = Math.min(100, state.training.progress + state.clickTrainPower);
  saveGame();
  completeHeroIfReady();
  updateUI();
}

function buySeed() {
  if (state.coins < 4) {
    return;
  }

  state.coins -= 4;
  state.seeds += 1;
  addActivity("Bought a fresh seed from the ranch supply cart.");
  saveGame();
  updateUI();
}

function completeHeroIfReady() {
  if (!state.training.active || state.training.progress < 100) {
    return;
  }

  const heroClass = heroClasses[state.roster.length % heroClasses.length];
  const hero = {
    id: Date.now() + state.roster.length,
    name: state.training.name,
    className: heroClass.name,
    icon: heroClass.icon,
    color: heroClass.color,
    status: "ready",
    missions: 0
  };

  state.training.active = false;
  state.training.progress = 0;
  state.training.name = "";
  state.roster.push(hero);
  state.coins += 12;
  addActivity(`${hero.name} graduated as a ${hero.className}! +12 coins.`);

  if (state.roster.length % 3 === 0) {
    state.clickGrowPower += 1;
    state.clickTrainPower += 1;
    addActivity(`Ranch level up! Watering and cheering are now stronger.`);
  }

  saveGame();
}

function dispatchQuest(questId) {
  if (state.activeQuest) {
    return;
  }

  const quest = quests.find((item) => item.id === questId);
  const heroId = Number(ui.heroSelect.value);
  const hero = state.roster.find((item) => item.id === heroId && item.status === "ready");

  if (!quest || ranchLevel() < quest.level || !hero) {
    return;
  }

  hero.status = "quest";
  state.activeQuest = { questId, heroId, remaining: quest.duration };
  addActivity(`${hero.name} set out on ${quest.name}.`);
  saveGame();
  updateUI();
}

function completeQuestIfReady() {
  if (!state.activeQuest || state.activeQuest.remaining > 0) {
    return;
  }

  const quest = quests.find((item) => item.id === state.activeQuest.questId);
  const hero = state.roster.find((item) => item.id === state.activeQuest.heroId);

  if (!quest || !hero) {
    console.error("Could not complete the active ranch quest.");
    state.activeQuest = null;
    saveGame();
    return;
  }

  hero.status = "ready";
  hero.missions += 1;
  state.coins += quest.coins;
  state.seeds += quest.seeds;
  state.activeQuest = null;
  addActivity(`${hero.name} completed ${quest.name}! The ranch earned ${quest.coins} coins${quest.seeds ? " and a seed" : ""}.`);
  saveGame();
}

function gameTick() {
  if (state.plot.planted && state.plot.growth < 100) {
    state.plot.growth = Math.min(100, state.plot.growth + 0.4 + ranchLevel() * 0.08);
  }

  if (state.training.active && state.training.progress < 100) {
    state.training.progress = Math.min(100, state.training.progress + 0.3 + ranchLevel() * 0.06);
  }

  if (state.activeQuest) {
    state.activeQuest.remaining = Math.max(0, state.activeQuest.remaining - TICK_SECONDS);
  }

  completeHeroIfReady();
  completeQuestIfReady();

  if (Date.now() - lastSavedAt >= 1000) {
    saveGame();
  }

  updateUI();
}

ui.plantBtn.addEventListener("click", plantPotato);
ui.clickGrowBtn.addEventListener("click", clickGrow);
ui.harvestBtn.addEventListener("click", harvestPotato);
ui.startTrainingBtn.addEventListener("click", startTraining);
ui.cheerBtn.addEventListener("click", cheerTrainee);
ui.buySeedBtn.addEventListener("click", buySeed);
ui.questList.addEventListener("click", (event) => {
  const questButton = event.target.closest("[data-quest]");
  if (questButton) {
    dispatchQuest(questButton.dataset.quest);
  }
});
window.addEventListener("beforeunload", saveGame);

updateUI();
setInterval(gameTick, TICK_SECONDS * 1000);
