Game.registerMod('TrueOffline', {
    init: function() {
        Game.LoadMod(this.PForPauseModLink);
        const int = setInterval(context => {
            if (typeof PForPause !== 'undefined') {
                clearInterval(int);
                context.PForPauseLoaded = true;
            }
        }, 50, this);
        //v2.053 english augment failure workaround
        if (EN) {
            locStrings['Offline duration: <b>%1</b> (<b>%2 frames</b>) (<b>x%3</b>)'] = 'Offline duration: <b>%1</b> (<b>%2 frames</b>) (<b>x%3</b>)';
            locStrings['Will be done in: %1'] = 'Will be done in: %1';
        }
        Game.LoadMod('https://cursedsliver.github.io/TrueOffline/locPatches/'+(localStorageGet('CookieClickerLang') ?? 'EN')+'.js');
    },
    locFoldersLink: 'https://cursedsliver.github.io/TrueOffline/locPatches',
    PForPauseModLink: 'https://cursedsliver.github.io/CCCEM/PForPause.js',
    PForPauseLoaded: false,
    simulating: false,
    originalSimulationTime: 0,
    simulationTime: 0,
    simulationTickMultiplier: 1,
    maxSimulationTickMultiplier: 4096,
    simulationDrawFramesRan: 0,
    lastDrawn: window.PForPause ? PForPause.realDate() : Date.now(),
    originalGameSpeed: 1,
    simulationSkipTickCount: 200,
    autosaveBackup: Game.prefs.autosave,
    computationRate: 0, //amount per draw frame, used to display ETA
    simulate: function(time) {
        //time = seconds
        if (this.simulation) { return; }
            
        this.simulationTime = time;
        this.originalSimulationTime = time;
        this.simulating = true;
        this.originalGameSpeed = PForPause.timeFactor;
        Game.prefs.autosave = 0;
        PForPause.changeGameSpeed(0);
        Game.Prompt(`<id simulationOngoing><noClose><h3>${loc('Simulating offline progress...')}</h3>
            <div class="line"></div><div class="block">
                <span id="simulationTimeLeft">${loc('Offline duration: <b>%1</b> (<b>%2 frames</b>) (<b>x%3</b>)', [this.digitalTimeDisplay(this.simulationTime), SimpleBeautify(Math.floor(this.simulationTime * Game.fps), SimpleBeautify(this.simulationTickMultiplier))])}</span>
                <div id="simulationProgressBar" style="width:100%;background-color:#000;border:1px solid #fff;height:20px;border-radius:2px;position:relative;padding: 1px;">
                    <div id="simulationProgressFill" style="background-color:#dee9ea;height:100%;width:0%;"></div>
                </div>
                <div style="margin-top:0.5em;font-size:0.8em;">
                    <small>${loc('Will be done in: %1', '<b><span id="simulationProgressETA">' + '</span></b>')}</small>
                </div>
            </div>
            <div class="block">
                ${loc('Click "speed up" to double the speed of the simulation at the cost of a bit of accuracy. Can be used repeatedly.')}
                <div class="line"></div>
                ${loc('Click "skip" to speed up the simulation to the maximum amount.')}
                <div class="line"></div>
                ${loc('Click "cancel" to cancel the simulation entirely.')}
            </div>
        `, [[loc('Speed up'), 'Game.mods.TrueOffline.speedUpSimulation(2)'], [loc('Skip'), 'Game.mods.TrueOffline.skipSimulation()'], [loc('Cancel'), 'Game.mods.TrueOffline.endSimulation()']], 0);
        setTimeout(context => {
            context.tickSimulation();
        }, 0, this);
    },
    tickSimulation: function() {
        const ticks = this.tickLogicUntilDraw(this.simulationTickMultiplier); 
        this.simulationTime -= this.simulationTickMultiplier * ticks / Game.fps;

        Game.Draw(); 
        l('simulationTimeLeft').innerHTML = loc('Offline duration: <b>%1</b> (<b>%2 frames</b>) (<b>x%3</b>)', [this.digitalTimeDisplay(this.simulationTime), SimpleBeautify(Math.floor(this.simulationTime * Game.fps)), SimpleBeautify(this.simulationTickMultiplier)]);
        l('simulationProgressFill').style.width = `${Math.floor(100 * (1 - this.simulationTime / this.originalSimulationTime))}%`;
        const curve = Math.pow(Math.pow(1 - this.simulationDrawFramesRan / (3 * Game.fps), 0), 0.5);
        this.computationRate = Math.max(curve, 0.99) * this.computationRate + Math.max(curve * 0.1, 0.01) * ticks; //magic
        l('simulationProgressETA').textContent = this.digitalTimeDisplay(this.simulationTime * Game.fps / this.simulationTickMultiplier / this.computationRate);
        this.lastDrawn = PForPause.realDate();
        this.simulationDrawFramesRan++;
        
        if (this.simulationTime > 0) { setTimeout(context => { context.tickSimulation(); }, 0, this); }
        else { this.endSimulation(); }
    },
    tickLogicUntilDraw: function(mult) {
        if (!this.simulating) { return; }
        const repeats = 2000;
        PForPause.changeGameSpeed(mult);
        for (let i = 0; i < repeats; i++) { 
            Game.Logic(); 
            if (this.lastDrawn + 1000 / Game.fps < PForPause.realDate()) {
                PForPause.changeGameSpeed(0);
                return i;
            }
        }
        PForPause.changeGameSpeed(0);
        return repeats;
    },
    tickLogic: function(mult, repeats) {
        if (!this.simulating) { return; }
        PForPause.changeGameSpeed(mult);
        for (let i = 0; i < repeats; i++) { 
            Game.Logic(); 
        }
        PForPause.changeGameSpeed(0);
        return repeats;
    },
    speedUpSimulation: function(mult) {
        this.simulationTickMultiplier = Math.min(this.simulationTickMultiplier * mult, this.simulationTime * Game.fps / this.simulationSkipTickCount, this.maxSimulationTickMultiplier);
        if (this.simulationTickMultiplier >= Math.min(this.simulationTime * Game.fps / this.simulationSkipTickCount, this.maxSimulationTickMultiplier)) { 
            if (l('promptOption0')) { l('promptOption0').style.display = 'none'; }
        }
    },
    skipSimulation: function() {
        this.speedUpSimulation(1000);
        if (l('promptOption1')) { l('promptOption1').style.display = 'none'; }
    },
    endSimulation: function() {
        this.simulationTime = 0; 
        this.simulating = false; 
        PForPause.changeGameSpeed(this.originalGameSpeed); 
        Game.prefs.autosave = this.autosaveBackup;
        Game.ClosePrompt();
    },
    digitalTimeDisplay: function(seconds) {
        seconds = Math.max(0, Math.floor(seconds));
        const days = Math.floor(seconds / 86400);
        seconds -= days * 86400;
        const hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds - minutes * 60;
        const pad = value => value.toString().padStart(2, '0');
        if (days) {
            return `${days}:${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
        } else if (hours) {
            return `${hours}:${pad(minutes)}:${pad(secs)}`;
        } else {
            return `${minutes}:${pad(secs)}`;
        }
    },
    locPatched: EN ? true : false,
    patchLoc: function(id,name,obj) {
        AddLanguage(id,name,obj,this);
        this.locPatched = true;
    },
    save: function() {
        return `${PForPause.realDate()}`; //testing purposes
    },
    load: function(str) {
        const timestamp = parseInt(str);
        this.autosaveBackup = Game.prefs.autosave;
        if (isNaN(timestamp)) return;
        const now = window.PForPause ? PForPause.realDate() : Date.now();
        const elapsed = now - timestamp;
        if (this.PForPauseLoaded && Game.ready) {
            this.simulate(elapsed / 1000);
        } else {
            const int = setInterval(context => {
                if (context.PForPauseLoaded && Game.ready) {
                    clearInterval(int);
                    context.simulate(elapsed / 1000);
                }
            }, 50, this);
        }
    }
})