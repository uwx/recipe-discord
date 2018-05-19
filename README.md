# scriptycord-franz
a simple discord injector for Franz. well, i can't say it's lightweight anymore, but it's powerful!

## version support
***scriptycord does not work on Stable as of March 11 2018.*** supporting both stable and canary is
too much work, you should just use canary instead. PTB support is untested.

## installing
download the franz fork from [uwx/scriptycord-franz](https://github.com/uwx/scriptycord-franz/releases),
clone this repository to `%appdata%\Franz\recipes\dev` and run `yarn install` inside the cloned directory

nodejs 8 or above is required. canary must be installed and kept up to date; the backing client will
not be automatically updated, so run canary to update periodically!

### info: the franz fork
basically, added a bunch of stuff to recipes for total control over the client:
* `recipe.config.hansenFastPreload`: set this to true and the recipe loader will look for a
  `fastpreload.js` script in the recipe's directory, and execute it synchronously. this is handy
  because it's guaranteed to execute as soon as the `preload` script in the  webview is dispatched.
* `recipe.config.hansenPartition`: this might not be available in the master branch but it changes
  the partition in which electron stores the webview's local storage
* `recipe.config.hansenWebviewOptions`: this object gets "unzipped" into the webview element's
  attributes, so every property becomes an attribute in the `<webview>` element created by franz.
  handy, for instance, to disable web security on the webview.also, removed a bunch of modules to be
  able to build it on windows 7, which was a nightmare. if you liked Quiet Hours integration in franz
  i'm afraid you'll be disappointed for now.

#### building the fork
basically, follow the appveyor.yml file's commands. the most important part is to rebuild modules for
node 8 API (if that's not already your nodejs version) and 32-bit (even if you're on a 64-bit system,
or else canary's precompiled native modules will not work at all)

## OS support
currently windows only, sorry. a significant portion of the code relies on the presence of the AppData
folder. the changes to make for linux support shouldn't be too many, but as i don't have a machine to
test on, there's no plans for it at the moment. however, anyone willing to port would be absolutely
welcome!

## plugins
BetterDiscord plugins can be placed in `data\plugins` or `%APPDATA%\BetterDiscord\plugins`

the recipe comes with the plugins i made for myself, under the same license as the rest of the project.

### API
since the move to franz, plugins are `require`-d like a regular nodejs module. as such, stuff that you
added to `scope` now goes in `exports` or `module.exports`, and instead of it being a global variable,
it's passed to `init`. you're encouraged to store it in your own variable if needed, but design-wise
you should try and avoid that.

additionally, this means you can use `require` to access node modules, or scriptycord internals! see the
internal API section for info on how to do that.

as a last note, keep in mind that because of the electron process lifecycle, hitting Reload Service in
franz doesn't "clean up" like refreshing does in regular canary. this means that, for instance, RPC might
get stuck. i'm currently working on a solution for asynchronous resource disposal, but for synchronous
stuff just use the `unload` event on `window`. (scriptycord will eventually have a dedicated API for this,
to avoid creating too many event listeners.)

* `exports` or `module.exports`: add your plugin definition here! it can contain any of the following:
  * `init => (scope)`: executed instantly after script eval.
  * `start => ()`: called once either `#friends` or `.chat` elements are loaded. use this to run code that
    relies on the DOM being loaded
  * `hooks[selector, callback(element)]`: an array that should contain arrays inside it, to add CSS
  	hooks for element listeners:
 	  * `selector`: string selector for the element
    * `callback(element)`: callback that takes the element as the only parameter
  * `onMessageTextLoaded => (element)`: callback for when `.message-text` is loaded
  * `onMessageGroupLoaded => (element)`: callback for when `.message-group` is loaded
  * `css`: CSS string to inject in the webpage
  * `name`: pretty plugin name for console display
  * `description`: pretty plugin description for console display
  * `version`: pretty plugin version for console display
  * `author`: pretty plugin author for console display

* `scope`: no longer a replacement for module.exports, now passed to `init()`
  * contains all the exports from domutils as convenience
  * `log([...message])`: like `console.log`, but prefixed with your plugin's name
  * `error([...message])`: like `console.error`, but prefixed with your plugin's name
  * `alog` and `aerror`: these are for internal use, don't use them or i will be very upset!

### internal API
#### window
* `Hansen`: 
  * `require(path)`: requires a module relative to the recipe root. i forgot why i haven't deleted this one,
    but i'm sure i have a good reason for it!
  * `path`: node.js `path` module
  * `mzfs`: `fsxt` module (originally `mz/fs`)
* `BdApi`: polyfill for BetterDiscord API
* `bdPluginStorage`: polyfill for BetterDiscord API
* `__sockets`: array containing any instantiated WebSocket instances and the arguments used to instantiate
  them.
* `__key_down_hooks`: array of functions you can add to to execute on keydown in the main text input field
* `__key_press_hooks` : array of functions you can add to to execute on keypress in the main text input field

#### ../../scriptycord/tokenGetter
* token is exposed in `scriptycord\externals\tokenGetter` (use `addTokenReadyCallback(func)` to listen for
  when the token is available, and it will be passed to the function)

#### ../../scriptycord/paths
* `recipeRoot`: the directory of the recipe's package.json, generally `%APPDATA%\Franz\recipes\dev\scriptycord-franz-recipe`
* `localStorageRoot`: `%APPDATA%\discordcanary\Local Storage`
* `protocolRoot`: `hansen://` protocol root (`data/protocol`)
* `userDataRoot`: `data/userData`
* `bdRoot`: `%APPDATA%\BetterDiscord` (root folder for BetterDiscord data)
* `bdPluginsRoot`: `%APPDATA%\BetterDiscord\plugins` (BD plugins folder)

#### ../scriptycord/utils/helpers
* `hansenExecute(func)`: Executes a function, synchronously or async, and provides a better log to console
  if execution succeeds or fails.
* `catchAsync(promise, errorMessage, def)`: returns a promise that resolves to the result of `promise` if
  it completes without errors, otherwise prints `errorMessage` to console and resolve to `def`

#### ../scriptycord/utils/domutils
* `addHook(selector, id, callback[, prettyCallbackName])`: register a CSS hook for an element listener.
  * `selector`: string selector for the element
  * `id`: unique ID for the hook
  * `callback(element)`: callback that takes the element as the only parameter
  * `prettyCallbackName`: since v23, the callback's function will be renamed to this. defaults to
    `scriptycord hook: {id}`, which should suffice for most cases. (hooks done using the array method
    will have a personalized name reflecting the plugin they're from.)
* `addStyle(css)`: injects a CSS string in the webpage
* `addScript(code)`: injects a code block in a new script element in the webpage
* `isLightTheme()`: returns `true` if light theme is enabled, `false` otherwise

## custom protocol
Local files can be placed in `data/protocol` and accessed in javascript (through XMLHttpRequest) or CSS
(through plain urls) through the `hansen://` protocol

## css
place CSS or LESS (to be automatically compiled) in `data/css` and they will be injected in alphabetical
order. the files will automatically be reloaded on changes. scriptycord comes with the CSS i made for
myself, under the same license as the rest of the project.

## node modules
you can install modules using `yarn` in the recipe's package.json root, then access them with `require` in
plugins or the chrome dev tools.

## extra goods
* css backdrop filter enabled in chrome experimental options
  
## disclaimer / achtung / waarschuwing / attention / advertencia / atenção / предупреждение / avvertimento
your token is stored in plain text and visible to page and plugin javascript. i am not responsible for bad
things that happen because of this.

modifying your client may be against discord's terms of service: [1](https://www.reddit.com/r/discordapp/comments/82tk0u/staff_resolve_vague_position_on_betterdiscord/dvcv43l/) [2](https://www.reddit.com/r/discordapp/comments/6erhdj/so_discord_doesnt_allow_betterdiscord_to_be_used/dicjjos/)

importantly, don't contact their support from any problems that arise from using scriptycord!
