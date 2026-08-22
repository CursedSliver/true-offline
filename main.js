(function() { function to() { Game.registerMod('TrueOffline', {
    version: '1.10',
    init: function() {
        this.populateResources();
        this.readyLoc();
        if (App && App.modList && App.modList.includes('P for Pause') && !App.mods['P for Pause'].disabled) {
            const int = setInterval(context => {
                if (typeof PForPause !== 'undefined' && PForPause) {
                    clearInterval(int);
                    context.PForPauseLoaded = true;
                }
                context.timeoutTimer++;
                if (context.timeoutTimer >= 200) {
                    clearInterval(int);
                    console.error('TrueOffline: PForPause failed to load');
                }
            }, 50, this);
            return;
        }
        if (window.PForPause) {
            this.PForPauseLoaded = true;
            return;
        }
        window.__PForPauseDefaultHotkeysEnabled__ = window.__PForPauseDefaultHotkeysEnabled__ ?? false;
        Game.LoadMod(this.PForPauseModLink);
        const int = setInterval(context => {
            if (typeof PForPause !== 'undefined' && PForPause) {
                clearInterval(int);
                context.PForPauseLoaded = true;
            }
            context.timeoutTimer++;
            if (context.timeoutTimer >= 200) {
                clearInterval(int);
                console.error('TrueOffline: PForPause failed to load');
            }
        }, 50, this);
    },
    readyLoc: function() {
        //v2.053 english augment failure workaround
        if (EN) {
            locStrings['Offline duration: <b>%1</b> (<b>%2 frames</b>) (<b>x%3</b>)'] = 'Offline duration: <b>%1</b> (<b>%2 frames</b>) (<b>x%3</b>)';
            locStrings['Will be done in: %1'] = 'Will be done in: %1';
        }
        Game.LoadMod(this.locFoldersLink+'/'+(localStorageGet('CookieClickerLang') ?? 'EN')+'.js');
    },
    PForPause__OnLoadScript: function(duplicateLoad) {
        if (duplicateLoad) {
            // While issues are possible with this, I've decided that it is not big enough right now such that a complicated system is warranted
            PForPause.defaltHotkeysEnabled = true;
            PForPause.notifyReady();
        }
    },
    populateResources: function() {
        Object.assign(this, {
            locFoldersLink: App?this.dir+'/locPatches':'https://cursedsliver.github.io/true-offline/locPatches',
            PForPauseModLink: App?this.dir+'/PForPause.js':'https://cursedsliver.github.io/CCCEM/PForPause.js'
        });
    },
    timeoutTimer: 0,
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
    simulationStart: 0,
    savedCumulativeRealTime: 0,
    simulate: function(time) {
        //time = seconds
        if (this.simulating) { return; }
            
        this.simulationTime = time;
        this.originalSimulationTime = time;
        this.simulating = true;
        this.originalGameSpeed = PForPause.timeFactor;
        this.simulationStart = PForPause.realDate();
        Game.prefs.autosave = 0;
        PForPause.changeGameSpeed(0);
        Game.Prompt(`<id simulationOngoing><noClose><h3>${loc('Simulating offline progress...')}</h3>
            <div class="line"></div><div class="block">
                <span id="simulationTimeLeft">${loc('Offline duration: <b>%1</b> (<b>%2 frames</b>) (<b>x%3</b>)', [this.digitalTimeDisplay(this.simulationTime), SimpleBeautify(Math.floor(this.simulationTime * Game.fps), SimpleBeautify(this.simulationTickMultiplier))])}</span>
                <div id="simulationProgressBar" style="width:100%;background-color:#000;border:1px solid #fff;height:20px;border-radius:2px;position:relative;padding:1px;margin-top:4px;">
                    <div id="simulationProgressFill" style="background-color:#dee9ea;height:100%;width:0%;"></div>
                </div>
                <div style="margin-top:0.5em;font-size:0.8em;">
                    <small>${loc('Will be done in: %1', '<b><span id="simulationProgressETA">' + '</span></b>')}</small>
                </div>
            </div>
            <div class="block">
                ${loc('Click "speed up" to double the speed of the simulation at the cost of a bit of accuracy. Can be used repeatedly.')}
            </div>
        `, [[loc('Speed up'), 'Game.mods.TrueOffline.speedUpSimulation(2)'], [loc('Max speed'), 'Game.mods.TrueOffline.skipSimulation()'], [loc('Abort'), 'Game.mods.TrueOffline.endSimulation()']], 0);
        setTimeout(context => {
            try { 
                context.tickSimulation();
            } catch(e) {
                console.error(e);
                context.endSimulation();
                context.handleSimulationError(context);
            }
        }, 0, this);
    },
    handleSimulationError: function(context) {
        if (context.savedCumulativeRealTime) {
            PForPause.cumulativeRealTime = context.savedCumulativeRealTime;
        }
        Game.Prompt(`<id simulationError><h3>${loc('Simulation error')}</h3>
                    <div class="line"></div>
                    <div class="block">
                        ${loc('An error occurred while simulating offline progress. Please report this error to the mod author (dm @cursedsliver on discord) alongside a screenshot of this prompt, your save (Export save), and your mod list.')}
                        <div class="line"></div>
                        ${e.message}
                        <div class="line"></div>
                        ${e.stack}
                    </div>
                `, [[loc('OK')]]);
    },
    tickSimulation: function() {
        const loopStart = PForPause.realDate();
        const ticks = this.tickLogicUntilDraw(this.simulationTickMultiplier); 
        const loopEnd = PForPause.realDate();
        const timeTaken = Math.min(PForPause.realDate() - this.lastDrawn, 35);
        this.simulationTime -= this.simulationTickMultiplier * ticks / Game.fps;
        if (this.simulationTime < 2 / Game.fps * this.simulationTickMultiplier && this.simulationTickMultiplier > 1) {
            this.simulationTickMultiplier /= 2;
        }

        Game.Draw(); 
        l('simulationTimeLeft').innerHTML = loc('Offline duration: <b>%1</b> (<b>%2 frames</b>) (<b>x%3</b>)', [this.digitalTimeDisplay(this.simulationTime), SimpleBeautify(Math.floor(this.simulationTime * Game.fps)), SimpleBeautify(this.simulationTickMultiplier)]);
        l('simulationProgressFill').style.width = `${Math.floor(100 * (1 - this.simulationTime / this.originalSimulationTime))}%`;
        if (this.simulationDrawFramesRan > (3 * Game.fps)) {
            this.computationRate = 0.998 * this.computationRate + 0.002 * ticks * Game.fps; //magic
        } else {
            this.computationRate = ticks * Game.fps;
        }
        l('simulationProgressETA').textContent = this.digitalTimeDisplay(this.simulationTime * Game.fps / this.simulationTickMultiplier / this.computationRate);
        PForPause.cumulativeRealTime += Math.max(((1000 / Game.fps) * ticks - timeTaken) * this.simulationTickMultiplier, 0);
        this.lastDrawn = loopEnd;
        this.simulationDrawFramesRan++;
        
        if (this.simulationTime > 0) { setTimeout(context => { context.tickSimulation(); }, 0, this); }
        else { this.endSimulation(); }
    },
    tickLogicUntilDraw: function(mult) {
        if (!this.simulating) { return; }
        const repeats = Math.max(Math.min(2000, this.simulationTime * Game.fps / this.simulationTickMultiplier - 10), 1);
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
        this.speedUpSimulation(Math.min(this.simulationTime * Game.fps / this.simulationSkipTickCount, this.maxSimulationTickMultiplier));
        if (l('promptOption0')) { l('promptOption0').style.display = 'none'; }
        if (l('promptOption1')) { l('promptOption1').style.display = 'none'; }
    },
    endSimulation: function() {
        this.simulationTime = 0; 
        this.simulating = false; 
        PForPause.changeGameSpeed(this.originalGameSpeed); 
        if (this.savedCumulativeRealTime && Math.abs(this.savedCumulativeRealTime - Date.now()) < 10000 + PForPause.realDate() - this.simulationStart) { 
            PForPause.cumulativeRealTime = this.savedCumulativeRealTime; 
            console.log('Time restored!', (this.savedCumulativeRealTime - Date.now()) / 1000, (PForPause.realDate() - this.simulationStart) / 1000);
        } else {
            console.log('Time drifted!', (this.savedCumulativeRealTime - Date.now()) / 1000, (PForPause.realDate() - this.simulationStart) / 1000);
        }
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
        if (!window.PForPause) {
            return `${Date.now()}`;
        }
        return `${PForPause.realDate()}`; //testing purposes
    },
    loadTimeout: 0,
    load: function(str) {
        const timestamp = parseInt(str);
        this.autosaveBackup = Game.prefs.autosave ?? 1;
        if (isNaN(timestamp)) return;
        const now = window.PForPause ? PForPause.realDate() : Date.now();
        const elapsed = Math.min(now - timestamp, 1000 * 3600 * 24 * 365);
        if (elapsed < 0) {
            return;
        }
        if (this.PForPauseLoaded && Game.ready) {
            this.savedCumulativeRealTime = PForPause.cumulativeRealTime;
            PForPause.cumulativeRealTime -= elapsed;
            try { 
                this.simulate(elapsed / 1000);
            } catch(e) {
                console.error(e);
                this.endSimulation();
                this.handleSimulationError(this);
            }
        } else {
            const int = setInterval(context => {
                if (context.PForPauseLoaded && Game.ready) {
                    clearInterval(int);
                    try { 
                        context.savedCumulativeRealTime = PForPause.cumulativeRealTime;
                        PForPause.cumulativeRealTime -= elapsed;
                        context.simulate(elapsed / 1000);
                    } catch(e) {
                        console.error(e);
                        context.endSimulation();
                        context.handleSimulationError(context);
                    }
                }
                context.loadTimeout++;
                if (context.loadTimeout >= 1000) {
                    clearInterval(int);
                    console.error('TrueOffline: PForPause failed to load');
                }
            }, 50, this);
        }
    }
}); }

function checkForReady() {
    return (typeof Game !== 'undefined' && Game && Game.ready);
}
if (checkForReady()) {
    to();
} else {
    const int = setInterval(() => {
        if (checkForReady()) {
            to();
            clearInterval(int);
        }
    }, 50);
}})();
// Testing
// Game.registerMod('TrueOffline', { init: function() { }, save: function() { return '' + (Date.now() - 1.25e7); } });