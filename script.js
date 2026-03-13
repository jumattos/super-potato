const state = {
  seeds: 3,
  potatoes: 0,
  heroes: 0,
  coins: 0,
  ranchLevel: 1,
  clickGrowPower: 3,
  clickTrainPower: 4,
  plot: {
    planted: false,
    growth: 0
  },
  training: {
    active: false,
    progress: 0
  }
};

const ui = {
  seeds: document.getElementById("seeds"),
  potatoes: document.getElementById("potatoes"),
  heroes: document.getElementById("heroes"),
  coins: document.getElementById("coins"),
  ranchLevel: document.getElementById("ranchLevel"),
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
  buySeedBtn: document.getElementById("buySeedBtn")
};

function setSpriteState(spriteEl, stateName) {
  spriteEl.classList.remove("seed", "sprout", "grown", "ready", "hero");
  spriteEl.classList.add(stateName);
}

function levelFromHeroes() {
  return Math.floor(state.heroes / 3) + 1;
}

function updateFarmSprite() {
  if (!state.plot.planted) {
    setSpriteState(ui.farmSprite, "seed");
    ui.plotStatus.textContent = "Your plot is empty. Plant a potato!";
    return;
  }

  if (state.plot.growth < 35) {
    setSpriteState(ui.farmSprite, "sprout");
    ui.plotStatus.textContent = "Tiny sprout! Keep clicking to help it grow.";
  } else if (state.plot.growth < 85) {
    setSpriteState(ui.farmSprite, "grown");
    ui.plotStatus.textContent = "Your super potato is getting chunky.";
  } else {
    setSpriteState(ui.farmSprite, "ready");
    ui.plotStatus.textContent = "Ready to harvest!";
  }
}

function updateTrainingSprite() {
  if (!state.training.active) {
    ui.academySprite.style.visibility = "hidden";
    ui.trainingStatus.textContent = "No trainee yet. Harvest a potato first.";
    return;
  }

  ui.academySprite.style.visibility = "visible";
  setSpriteState(ui.academySprite, "hero");

  if (state.training.progress < 100) {
    ui.trainingStatus.textContent = "Training in progress! Cheer to boost motivation.";
  } else {
    ui.trainingStatus.textContent = "Hero complete! Glory for Potato Ranch!";
  }
}

function updateUI() {
  state.ranchLevel = levelFromHeroes();
  ui.seeds.textContent = state.seeds;
  ui.potatoes.textContent = state.potatoes;
  ui.heroes.textContent = state.heroes;
  ui.coins.textContent = state.coins;
  ui.ranchLevel.textContent = state.ranchLevel;

  ui.growthBar.value = state.plot.growth;
  ui.growthLabel.textContent = `${Math.floor(state.plot.growth)}%`;
  ui.trainingBar.value = state.training.progress;
  ui.trainingLabel.textContent = `${Math.floor(state.training.progress)}%`;

  ui.plantBtn.disabled = state.plot.planted || state.seeds < 1;
  ui.clickGrowBtn.disabled = !state.plot.planted;
  ui.harvestBtn.disabled = !state.plot.planted || state.plot.growth < 100;
  ui.startTrainingBtn.disabled = state.training.active || state.potatoes < 1;
  ui.cheerBtn.disabled = !state.training.active;
  ui.buySeedBtn.disabled = state.coins < 4;

  updateFarmSprite();
  updateTrainingSprite();
}

function plantPotato() {
  if (state.plot.planted || state.seeds < 1) {
    return;
  }

  state.seeds -= 1;
  state.plot.planted = true;
  state.plot.growth = 0;
  updateUI();
}

function clickGrow() {
  if (!state.plot.planted) {
    return;
  }

  state.plot.growth = Math.min(100, state.plot.growth + state.clickGrowPower);
  updateUI();
}

function harvestPotato() {
  if (!state.plot.planted || state.plot.growth < 100) {
    return;
  }

  state.plot.planted = false;
  state.plot.growth = 0;

  state.potatoes += 1;
  const reward = 6 + state.ranchLevel;
  state.coins += reward;

  if (Math.random() < 0.45) {
    state.seeds += 1;
  }

  updateUI();
}

function startTraining() {
  if (state.training.active || state.potatoes < 1) {
    return;
  }

  state.potatoes -= 1;
  state.training.active = true;
  state.training.progress = 0;
  updateUI();
}

function cheerTrainee() {
  if (!state.training.active) {
    return;
  }

  state.training.progress = Math.min(100, state.training.progress + state.clickTrainPower);
  updateUI();
}

function buySeed() {
  if (state.coins < 4) {
    return;
  }

  state.coins -= 4;
  state.seeds += 1;
  updateUI();
}

function completeHeroIfReady() {
  if (!state.training.active || state.training.progress < 100) {
    return;
  }

  state.training.active = false;
  state.training.progress = 0;
  state.heroes += 1;
  state.coins += 12;

  if (state.heroes % 3 === 0) {
    state.clickGrowPower += 1;
    state.clickTrainPower += 1;
    ui.clickGrowBtn.textContent = `Click to Grow +${state.clickGrowPower}%`;
    ui.cheerBtn.textContent = `Cheer Trainee +${state.clickTrainPower}%`;
  }

  updateUI();
}

function gameTick() {
  if (state.plot.planted && state.plot.growth < 100) {
    const passiveGrowth = 0.4 + state.ranchLevel * 0.08;
    state.plot.growth = Math.min(100, state.plot.growth + passiveGrowth);
  }

  if (state.training.active && state.training.progress < 100) {
    const passiveTraining = 0.3 + state.ranchLevel * 0.06;
    state.training.progress = Math.min(100, state.training.progress + passiveTraining);
  }

  completeHeroIfReady();
  updateUI();
}

ui.plantBtn.addEventListener("click", plantPotato);
ui.clickGrowBtn.addEventListener("click", clickGrow);
ui.harvestBtn.addEventListener("click", harvestPotato);
ui.startTrainingBtn.addEventListener("click", startTraining);
ui.cheerBtn.addEventListener("click", cheerTrainee);
ui.buySeedBtn.addEventListener("click", buySeed);

updateUI();
setInterval(gameTick, 200);