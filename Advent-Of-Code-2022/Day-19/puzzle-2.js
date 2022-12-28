// const { input } = require("./parse");
// console.time("ExecutionTime");
//
// const canAfford = (cost, ore, clay, obsidian) => {
//   let oreCost = cost.find((c) => c.resource === "ore");
//   let clayCost = cost.find((c) => c.resource === "clay");
//   let obsidianCost = cost.find((c) => c.resource === "obsidian");
//
//   return (
//     (oreCost === undefined || oreCost.amount <= ore) &&
//     (clayCost === undefined || clayCost.amount <= clay) &&
//     (obsidianCost === undefined || obsidianCost.amount <= obsidian)
//   );
// };
//
// const craftRobot = (
//   robotCost,
//   oreProduction,
//   clayProduction,
//   obsidianProduction,
//   newTimeLeft
// ) => {
//   let { ore, orePerSecond } = oreProduction;
//   let { clay, clayPerSecond } = clayProduction;
//   let { obsidian, obsidianPerSecond } = obsidianProduction;
//
//   while (!canAfford(robotCost, ore, clay, obsidian) && newTimeLeft > 0) {
//     ore += orePerSecond;
//     clay += clayPerSecond;
//     obsidian += obsidianPerSecond;
//     newTimeLeft--;
//   }
//
//   ore += orePerSecond;
//   clay += clayPerSecond;
//   obsidian += obsidianPerSecond;
//   newTimeLeft--;
//   for (let cost of robotCost) {
//     if (cost.resource === "ore") ore -= cost.amount;
//
//     if (cost.resource === "clay") clay -= cost.amount;
//     if (cost.resource === "obsidian") obsidian -= cost.amount;
//   }
//
//   return { ore, clay, obsidian, newTimeLeft };
// };
//
// const nextOptimalRobot = (
//   oreProduction,
//   clayProduction,
//   obsidianProduction,
//   geodeProduction,
//   timeLeft,
//   blueprint
// ) => {
//   let geodeProduced = 0;
//   for (let robot of blueprint) {
//     if (robot.type === "ore" && timeLeft < 24) continue;
//     if (robot.type === "clay" && timeLeft < 12) continue;
//     if (robot.type === "obsidian" && timeLeft < 8) continue;
//     if (robot.type === "geode" && timeLeft < 2) continue;
//
//     let { ore, clay, obsidian, newTimeLeft } = craftRobot(
//       robot.cost,
//       oreProduction,
//       clayProduction,
//       obsidianProduction,
//       timeLeft
//     );
//     if (newTimeLeft <= 0) {
//       continue;
//     }
//
//     let newOreProduction = { ...oreProduction };
//     let newClayProduction = { ...clayProduction };
//     let newObsidianProduction = { ...obsidianProduction };
//     let newGeodeProduction = { ...geodeProduction };
//     if (robot.type === "ore") newOreProduction.orePerSecond++;
//     if (robot.type === "clay") newClayProduction.clayPerSecond++;
//     if (robot.type === "obsidian") newObsidianProduction.obsidianPerSecond++;
//     if (robot.type === "geode") newGeodeProduction.geodePerSecond++;
//     newOreProduction.ore = ore;
//     newClayProduction.clay = clay;
//     newObsidianProduction.obsidian = obsidian;
//     let score = robot.type === "geode" ? newTimeLeft : 0;
//
//     score += nextOptimalRobot(
//       newOreProduction,
//       newClayProduction,
//       newObsidianProduction,
//       newGeodeProduction,
//       newTimeLeft,
//       blueprint
//     );
//
//     if (score > geodeProduced) {
//       geodeProduced = score;
//     }
//   }
//   return geodeProduced;
// };
//
// let qualitySum = 1;
// for (let i = 0; i < 3; i++) {
//   let blueprint = input[i];
//   let score = nextOptimalRobot(
//     { ore: 0, orePerSecond: 1 },
//     { clay: 0, clayPerSecond: 0 },
//     { obsidian: 0, obsidianPerSecond: 0 },
//     { geode: 0, geodePerSecond: 0 },
//     32,
//     blueprint
//   );
//   qualitySum *= score;
// }
// console.log(qualitySum);
//
// console.timeEnd("ExecutionTime");


const path = require("path");
const fs = require("fs");
let { performance } = require("perf_hooks");

const input = fs.readFileSync(path.join(__dirname, "input.txt"), "utf8");
const execStart = performance.now();

/* begin solution */

// many thanks to https://github.com/Mike-Bell
// inspiration taken from https://www.reddit.com/r/adventofcode/comments/zpihwi/comment/j0unhov/?utm_source=share&utm_medium=web2x&context=3

const ResourceType = {
  Ore: 0,
  Clay: 1,
  Obsidian: 2,
  Geode: 3,
};

const blueprintRegex =
  /Blueprint (\d+): Each ore robot costs (\d+) ore\. Each clay robot costs (\d+) ore\. Each obsidian robot costs (\d+) ore and (\d+) clay\. Each geode robot costs (\d+) ore and (\d+) obsidian\./;

const blueprints = input
  .split("\n")
  .slice(0, 3)
  .map((line) => line.match(blueprintRegex))
  .map(
    ([
      ,
      id,
      oreRobotOre,
      clayRobotOre,
      obsidianRobotOre,
      obsidianRobotClay,
      geodeRobotOre,
      geodeRobotObsidian,
    ]) => ({
      id: Number(id),
      [ResourceType.Ore]: [[ResourceType.Ore, Number(oreRobotOre)]],
      [ResourceType.Clay]: [[ResourceType.Ore, Number(clayRobotOre)]],
      [ResourceType.Obsidian]: [
        [ResourceType.Ore, Number(obsidianRobotOre)],
        [ResourceType.Clay, Number(obsidianRobotClay)],
      ],
      [ResourceType.Geode]: [
        [ResourceType.Ore, Number(geodeRobotOre)],
        [ResourceType.Obsidian, Number(geodeRobotObsidian)],
      ],
    })
  )
  .map((blueprint) => ({
    ...blueprint,
    max: Object.values(ResourceType).map((type) =>
      Math.max(
        ...Object.values(ResourceType)
          .flatMap((t) => blueprint[t])
          .filter(([resource]) => resource === type)
          .map(([, requirement]) => requirement)
      )
    ),
  }));

const answer = blueprints.reduce(
  (acc, b) => acc * exploreBlueprint(32, [1, 0, 0, 0], [0, 0, 0, 0], b),
  1
);

function exploreBlueprint(minutes, robots, resources, blueprint) {
  let bestResult = resources[ResourceType.Geode];
  if (minutes > 1) {
    for (const type of Object.values(ResourceType)) {
      const canBuild = blueprint[type].every(([t]) => robots[t] > 0); // consider building only if robots for the required resources exist
      const shouldBuild =
        type === ResourceType.Geode || robots[type] < blueprint.max[type]; // always build geode robots, but only build as much robots per recource as can be consumed per minute
      if (canBuild && shouldBuild) {
        const timeToResources = Math.max(
          ...blueprint[type].map(([resource, requirement]) =>
            Math.ceil((requirement - resources[resource]) / robots[resource])
          ),
          0
        );
        const timeToBuild = timeToResources + 1;
        const nextRobots = Object.values(ResourceType).map((t) =>
          t === type ? robots[t] + 1 : robots[t]
        );
        const nextResources = Object.values(ResourceType).map(
          (t) => resources[t] + robots[t] * timeToBuild
        );
        blueprint[type].forEach(
          ([resource, requirement]) => (nextResources[resource] -= requirement)
        );
        const nextTime = minutes - timeToBuild;
        if (nextTime > -1) {
          const nextResult = exploreBlueprint(
            nextTime,
            nextRobots,
            nextResources,
            blueprint
          );
          if (nextResult > bestResult) {
            bestResult = nextResult;
          }
        }
      }
    }

    return bestResult;
  } else {
    return resources[ResourceType.Geode] + minutes * robots[ResourceType.Geode];
  }
}

/* end solution */

const execEnd = performance.now();
const micros = (execEnd - execStart) * 1000;
console.log(`${answer} (${micros.toFixed(2)} µs)`);
