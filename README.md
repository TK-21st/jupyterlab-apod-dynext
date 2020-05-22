# Dynamically Loaded Widget Module for JLab Extension
Frustrated with extension build-time?? Frustrate no more!!

While the Dev Team of JupyterLab is working on Module Federation for JLab version 3.x (which will solve all of our problems),
we provide a real(janky) simple solution which allows you to dynamically load your Widget Module.

This repository is heavily inspired by [jupyterlab-dynext](https://github.com/wolfv/jupyterlab-dynext) created by `wolfv`,
the two repositories are complimentary in the sense that `jupyterlab-dynext` allows you to dynamically load `extension` while
what we have here is a way to dynamically load `widget`. 

## Example Usage

### 1. Build Extension as usual
We first build our extension as usual:
```bash
cd apod-extension
npm install 
jupyter labextension link .
jupyter lab build
```
The `apod-extension` code is really just a shell, it does the following:
1. Inject RequireJS into browser head if it's not there already
2. Create a JLab command which when activated does:
    1. use `RequireJS` to load your Widget Module from `localhost:7779/build/bundle.js`. 
        This gets the locally served Widget Module file so that the extension can instantiate it. 
        The port `7999` is served by http-server and the port number is hard-coded into `apod/package.json` as well as `apod-extension/src/index.ts`.
        You'll need to change it on both sides if you want to use a different port for now.
    2. Spin up your extension in the callback of `require` so that we can use that widget!

The `apod` code is the Widget Module, which in my experience is where we do most of our devs (and therefore also incurring the most rebuilding). 
What you need to do is the following:
```bash
cd apod
npm install
npm run dev
```

### 2. Serve your Widget Module to your extension dynamically
The `npm run dev` command does a few things _concurrently_:
1. It starts a http-server in the `apod` directory on port 7999 (can be changed in `package.json`)
2. It runs `nodemon` which watches the `apod/src/` folder for file changes, and once detected does the following _sequentially_:
    1. Compile the ts code into `lib/*.js` code
    2. Bundle the compiled `lib/*.js` code into a webpacked code `build/bundle.js`.

Once you start `npm run dev`, you should see
```
$ npm run dev

> jupyterlab-apod-dynext@0.1.0 dev /your/path/to/jupyterlab-apod-dynext/apod
> concurrently "http-server -p 7999" "npm:watch"

[watch] 
[watch] > jupyterlab-apod-dynext@0.1.0 watch /your/path/to/jupyterlab-apod-dynext/apod
[watch] > nodemon -e .ts --exec "npm run build"
[watch] 
[0] Starting up http-server, serving ./
[0] Available on:
[0]   http://127.0.0.1:7999
[0]   http://192.168.86.229:7999
[0] Hit CTRL-C to stop the server
[watch] [nodemon] 2.0.4
[watch] [nodemon] to restart at any time, enter `rs`
[watch] [nodemon] watching path(s): *.*
[watch] [nodemon] watching extensions: ts
[watch] [nodemon] starting `npm run build`
[watch] 
[watch] > jupyterlab-apod-dynext@0.1.0 build /your/path/to/jupyterlab-apod-dynext/apod
[watch] > tsc && webpack
[watch] 
[watch] Hash: 79841bbde20f21bdb629
[watch] Version: webpack 4.43.0
[watch] Time: 899ms
[watch] Built at: 05/22/2020 11:06:49 AM
[watch]     Asset     Size  Chunks             Chunk Names
[watch] bundle.js  983 KiB    main  [emitted]  main
[watch] Entrypoint main = bundle.js
[watch] [0] crypto (ignored) 15 bytes {main} [built]
[watch] [../../../../../.nvm/versions/node/v11.10.1/lib/node_modules/webpack/buildin/global.js] (webpack)/buildin/global.js 472 bytes {main} [built]
[watch] [./lib/index.js] 305 bytes {main} [built]
[watch] [./lib/widget.js] 2.34 KiB {main} [built]
[watch]     + 69 hidden modules
[watch] [nodemon] clean exit - waiting for changes before restart
```

Whenever you make changes to the `apod/src/*.ts` files, you should see:
```
[watch] [nodemon] restarting due to changes...
[watch] [nodemon] starting `npm run build`
[watch] 
[watch] > jupyterlab-apod-dynext@0.1.0 build /your/path/to/jupyterlab-apod-dynext/apod
[watch] > tsc && webpack
[watch] 
[watch] Hash: eeed08e886ea03c47081
[watch] Version: webpack 4.43.0
[watch] Time: 678ms
[watch] Built at: 05/22/2020 11:07:36 AM
[watch]     Asset     Size  Chunks             Chunk Names
[watch] bundle.js  983 KiB    main  [emitted]  main
[watch] Entrypoint main = bundle.js
[watch] [0] crypto (ignored) 15 bytes {main} [built]
[watch] [../../../../../.nvm/versions/node/v11.10.1/lib/node_modules/webpack/buildin/global.js] (webpack)/buildin/global.js 472 bytes {main} [built]
[watch] [./lib/index.js] 305 bytes {main} [built]
[watch] [./lib/widget.js] 2.53 KiB {main} [built]
[watch]     + 69 hidden modules
[watch] Hash: eeed08e886ea03c47081
[watch] Version: webpack 4.43.0
[watch] Time: 801ms
[watch] Built at: 05/22/2020 11:07:38 AM
[watch]     Asset     Size  Chunks             Chunk Names
[watch] bundle.js  983 KiB    main  [emitted]  main
[watch] Entrypoint main = bundle.js
[watch] [0] crypto (ignored) 15 bytes {main} [built]
[watch] [../../../../../.nvm/versions/node/v11.10.1/lib/node_modules/webpack/buildin/global.js] (webpack)/buildin/global.js 472 bytes {main} [built]
[watch] [./lib/index.js] 305 bytes {main} [built]
[watch] [./lib/widget.js] 2.53 KiB {main} [built]
[watch]     + 69 hidden modules
[watch] [nodemon] clean exit - waiting for changes before restart
```

### 3. Use your Extension!
When you launch the extension in the `Command > Random Astronomy Picture` in JLab browser, you will see that the astronomy figure shows up (as in the APOD demo), in your `apod`'s `npm run dev` output, you should see something like :
```
[0] [Fri May 22 2020 11:30:49 GMT-0400 (Eastern Daylight Time)]  "GET /build/bundle.js" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36"
```

This indicates that the browser has grabbed the `apod/build/bundle.js` file. Now you can make changes to `apod/src/*.ts` file, wait for it to be recompiled (`tsc` and `webpack`) and refresh the JLab browser window. You should see the changes immediately.