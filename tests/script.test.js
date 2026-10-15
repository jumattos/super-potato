const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const script = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");
const saveKey = "super-potato-ranch-save-v2";

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(value) {
    this.values.add(value);
  }

  remove(...values) {
    values.forEach((value) => this.values.delete(value));
  }
}

class FakeElement {
  constructor() {
    this.classList = new FakeClassList();
    this.dataset = {};
    this.disabled = false;
    this.hidden = false;
    this.innerHTML = "";
    this.listeners = new Map();
    this.style = {};
    this.textContent = "";
    this.value = "";
  }

  addEventListener(name, listener) {
    this.listeners.set(name, listener);
  }

  click() {
    this.listeners.get("click")?.({ target: this });
  }
}

function createGame(savedState, random = 0.9) {
  const elements = new Map();
  const intervals = [];
  const storage = new Map();
  const errors = [];
  const fakeMath = Object.create(Math);
  fakeMath.random = () => random;

  if (savedState !== undefined) {
    storage.set(saveKey, typeof savedState === "string" ? savedState : JSON.stringify(savedState));
  }

  const document = {
    getElementById(id) {
      if (!elements.has(id)) {
        elements.set(id, new FakeElement());
      }

      return elements.get(id);
    }
  };
  const localStorage = {
    getItem(key) {
      return storage.get(key) ?? null;
    },
    setItem(key, value) {
      storage.set(key, value);
    }
  };
  const window = new FakeElement();
  const context = vm.createContext({
    console: { error: (...messages) => errors.push(messages) },
    Date,
    document,
    JSON,
    localStorage,
    Math: fakeMath,
    setInterval(callback) {
      intervals.push(callback);
    },
    window
  });

  vm.runInContext(script, context);

  return {
    element: (id) => elements.get(id),
    errors,
    runTicks(count) {
      for (let index = 0; index < count; index += 1) {
        intervals[0]();
      }
    },
    saved() {
      return JSON.parse(storage.get(saveKey));
    },
    window
  };
}

test("starts with an empty homestead and an available farm", () => {
  const game = createGame();

  assert.equal(game.element("heroes").textContent, 0);
  assert.equal(game.element("emptyRoster").hidden, false);
  assert.equal(game.element("plantBtn").disabled, false);
  assert.equal(game.element("heroSelect").disabled, true);
  assert.match(game.element("activityLog").innerHTML, /ranch gates are open/i);
});

test("graduates a named hero into the homestead", () => {
  const game = createGame({ potatoes: 1 });

  game.element("startTrainingBtn").click();
  for (let index = 0; index < 25; index += 1) {
    game.element("cheerBtn").click();
  }

  const saved = game.saved();
  assert.equal(saved.roster.length, 1);
  assert.equal(saved.roster[0].name, "Spudnik");
  assert.equal(saved.roster[0].className, "Mash Mage");
  assert.equal(saved.coins, 12);
  assert.equal(game.element("heroes").textContent, 1);
  assert.equal(game.element("emptyRoster").hidden, true);
  assert.match(game.element("heroRoster").innerHTML, /Spudnik/);
  assert.match(game.element("activityLog").innerHTML, /graduated/);
});

test("levels up the ranch after every third graduate", () => {
  const game = createGame({
    potatoes: 1,
    roster: [
      { id: 1, name: "Chip", className: "Scout", icon: "X", color: "green", status: "ready", missions: 0 },
      { id: 2, name: "Mash", className: "Mage", icon: "X", color: "plum", status: "ready", missions: 0 }
    ]
  });

  game.element("startTrainingBtn").click();
  for (let index = 0; index < 25; index += 1) {
    game.element("cheerBtn").click();
  }

  const saved = game.saved();
  assert.equal(saved.roster.length, 3);
  assert.equal(saved.clickGrowPower, 4);
  assert.equal(saved.clickTrainPower, 5);
  assert.equal(game.element("ranchLevel").textContent, 2);
  assert.equal(game.element("clickGrowBtn").textContent, "Water +4%");
  assert.match(game.element("activityLog").innerHTML, /level up/i);
});

test("dispatches a hero and pays quest rewards on return", () => {
  const game = createGame({
    roster: [
      { id: 7, name: "Yam Solo", className: "Spud Scout", icon: "X", color: "green", status: "ready", missions: 0 }
    ]
  });
  game.element("heroSelect").value = "7";

  const questButton = {
    dataset: { quest: "meadow" },
    closest: () => questButton
  };
  game.element("questList").listeners.get("click")({ target: questButton });

  assert.equal(game.saved().roster[0].status, "quest");
  assert.equal(game.element("activeQuest").hidden, false);
  assert.match(game.element("activeQuestName").textContent, /Yam Solo/);

  game.runTicks(61);

  const saved = game.saved();
  assert.equal(saved.activeQuest, null);
  assert.equal(saved.roster[0].status, "ready");
  assert.equal(saved.roster[0].missions, 1);
  assert.equal(saved.coins, 8);
  assert.match(game.element("activityLog").innerHTML, /completed Meadow Patrol/);
});

test("grows and harvests a potato without exceeding progress limits", () => {
  const game = createGame(undefined, 0.9);

  game.element("plantBtn").click();
  for (let index = 0; index < 34; index += 1) {
    game.element("clickGrowBtn").click();
  }

  assert.equal(game.element("growthLabel").textContent, "100%");
  assert.equal(game.element("harvestBtn").disabled, false);
  game.element("harvestBtn").click();

  const saved = game.saved();
  assert.equal(saved.potatoes, 1);
  assert.equal(saved.coins, 7);
  assert.equal(saved.seeds, 2);
  assert.equal(saved.plot.planted, false);
});

test("buys seeds and preserves the latest state before unloading", () => {
  const game = createGame({ coins: 4 });

  game.element("buySeedBtn").click();
  game.window.listeners.get("beforeunload")();

  const saved = game.saved();
  assert.equal(saved.coins, 0);
  assert.equal(saved.seeds, 4);
  assert.match(saved.activity[0], /fresh seed/);
});

test("falls back to a fresh ranch when saved data is invalid", () => {
  const game = createGame("{not-json");

  assert.equal(game.element("seeds").textContent, 3);
  assert.equal(game.element("heroes").textContent, 0);
  assert.equal(game.errors.length, 1);
});
