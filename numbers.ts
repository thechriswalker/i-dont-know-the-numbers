import { parse } from "https://deno.land/std/flags/mod.ts";

function main() {
  const args = parse(Deno.args);
  const n = args?.n ?? 100;
  if (!Number.isSafeInteger(n) || n < 2) {
    usage(2);
  }
  const r = args?.r;
  if (r && (!Number.isSafeInteger(r) || r < 1)) {
    usage(2);
  }

  if (r) {
    console.log("Finding a solution for N =", n, "targeting", r, "rounds.");
    let round = 0;
    for (const x of generateSolutions(n)) {
      round = x.round;
      if (x.round === r) {
        if (x.result) {
          console.log(x);
          Deno.exit(0);
        } else {
          console.error("no solution at round", x.round);
          Deno.exit(1);
        }
      }
    }
    console.error(
      "did not reach round",
      r,
      "(progress stopped at round",
      round,
      ")"
    );
    Deno.exit(1);
  } else {
    console.log("Finding all solutions for N =", n);
    for (const x of generateSolutions(n)) {
      if (x.result) {
        console.log(
          "Round:",
          x.round,
          `${x.result.person}: "I (could) know the numbers.`,
          x.result.numbers
        );
      }
    }
  }
}

main();

function usage(exitCode: number) {
  console.error(`usage: deno run numbers.ts [options]

options:
    -n <num>    max number to choose from (default: 100 - numbers 1-99)
                if provided must be an integer > 1
    -r <num>    target round for answer, if no result that round - stop anyway
                default is "no choice" which prints all possible solutions.
                if provided must be an integer > 0
`);
  Deno.exit(exitCode);
}

type Pair = [a: number, b: number];

type Names = "Peter" | "Sandy";

type RoundResult = {
  round: number;
  result: null | { numbers: Pair; person: Names };
};

type PairMap = Map<number, Set<Pair>>;

function* generateSolutions(n: number) {
  const products: PairMap = new Map();
  const sums: PairMap = new Map();
  const pairs = initialise(products, sums, n);

  // now iterate until we find solutions.
  // start with Peter (products), then Sandy (sums).
  let isPeter = true;

  let round = 0;
  let pairsLastRound = pairs.size;
  while (true) {
    // let's process a round.
    round++;
    if (isPeter) {
      // could peter know the numbers?
      yield findPossibleSolution(round, products, "Peter");
      // but continue anyway.
      // given Peter doesn't know the solution, remove more pairs.
      removeCandidates(products, sums, pairs);
    } else {
      // could sandy know the numbers?
      yield findPossibleSolution(round, sums, "Sandy");
      // but continue anyway.
      // given Sandy doesn't know the solution, remove more pairs.
      removeCandidates(sums, products, pairs);
    }
    // if no pairs where removed, then we quit.
    if (pairsLastRound === pairs.size) {
      return;
    }
    // now what? another round.
    isPeter = !isPeter;
    pairsLastRound = pairs.size;
  }
}

function first<T>(s: Set<T>): T {
  return [...s][0]!;
}

function findPossibleSolution(
  round: number,
  m: PairMap,
  person: Names
): RoundResult {
  // a solution is a unique single pair choice.
  const possible = new Set<Pair>();
  for (const [, pairs] of m) {
    if (pairs.size === 1) {
      possible.add(first(pairs));
    }
  }
  // only have a solution if there is only one possibility.
  if (possible.size === 1) {
    return {
      round,
      result: { person, numbers: first(possible) },
    };
  }
  return { round, result: null };
}

function removeCandidates(
  from: PairMap,
  other: PairMap,
  candidates: Set<Pair>
) {
  // iterate "from", and remove keys where only one solution is present
  // when we remove those solutions, we must also remove the same pairs
  // from the candidate set.
  // finally, we re-run through BOTH PairMaps and remove all instances
  // of the same pairs we just removed. (as they can't be solutions.)
  const removed = new Set<Pair>();
  for (const [key, pairs] of from) {
    if (pairs.size === 1) {
      // remove it.
      const p = first(pairs);
      removed.add(p);
      candidates.delete(p);
      from.delete(key);
    }
  }
  // now run through and remove, from first.
  for (const [key, pairs] of from) {
    for (const p of removed) {
      pairs.delete(p); // this is a no-op if not present, so don't bother checking
    }
    if (pairs.size === 0) {
      from.delete(key);
    }
  }
  // same for other
  for (const [key, pairs] of other) {
    for (const p of removed) {
      pairs.delete(p); // this is a no-op if not present, so don't bother checking
    }
    if (pairs.size === 0) {
      other.delete(key);
    }
  }
}

function initialise(p: PairMap, s: PairMap, n: number) {
  const pairs = new Set<Pair>();
  for (let a = 1; a < n; a++) {
    for (let b = a; b < n; b++) {
      const pair: Pair = [a, b];
      pairs.add(pair);
      upsert(p, a * b, pair);
      upsert(s, a + b, pair);
    }
  }
  return pairs;
}

function upsert(m: PairMap, n: number, p: Pair) {
  const existing = m.get(n);
  if (existing) {
    existing.add(p);
  } else {
    m.set(n, new Set([p]));
  }
}
