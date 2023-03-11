// Load libs

Function(chowjs.loadFile(`patch/beaf/beaf.js`))();

// Init crash file

chowjs.writeFile("save/crash.txt", "");

// Replace print to inject patches at runtime
const _print = globalThis.print;

let firstRun = true;

globalThis.print = function print(...args){
  let output = String(args);

  if(firstRun && output.startsWith("readFile: ")){
    firstRun = false;

    // Don't load patch at priority -1
    const patches = fs_module.readdirSync("/patch").filter(file => file.endsWith(".js")).map(file => (Function(chowjs.loadFile(`patch/${file}`))())).filter(a => a.priority != -1).sort((a,b) => (a.priority-b.priority));

    print("Patching...");

    for(const { name, patch } of patches){
      print(`Initializing ${name}`);
      try {
        patch();
      } catch(e){
        print(`Error occured while loading ${name} patch`);
        chowjs.writeFile("save/patch_error_stack.txt", `${e.name} [${name}]: ${e.message}\n${e.stack}`);
      }
    }

    print("Finished!");
  }

  return _print.call(this, ...args);
}

// Throw error to force load full.bin
throw new Error("")