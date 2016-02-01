/*:
 * @plugindesc steal plugin
 * @author RCWizard
 * @help implementation of a steal skill effect
 *
 * ==================================================================
 * Steal Skills
 * ==================================================================
 * Add the following tag to a skill note entry to add the steal skill
 * effect
 *
 * <EFFECT>
 * STEALONE[,modifier]
 * </EFFECT>
 *
 * where [,modifier] is optional
 *
 * There are two types of steal effects, STEALONE and STEALALL.
 *
 * STEALONE will iterate over each stealable item entry for an enemy
 * until an item is successfully stolen for this action
 *
 * STEALALL will iterate over each stealable item entry for an enemy
 * attempting to steal the item associated with the entry even if
 * previous items have been stolen this action
 *
 * Only a single item per entry will be stolen per action regardless
 * of the the steal effect used.
 *
 * The steal effect can also be supplied with a modifier that will
 * adjust the base percentage chance of a successful steal
 *
 * Examples:
 *
 * <EFFECT>
 * STEALALL,-20
 * </EFFECT> 
 * A weak steal effect that applies a -20 percent modifier to a
 * stealable items base steal chance and will attempt to steal each
 * stealable item for this enemy
 *
 *
 * <EFFECT>
 * STEALONE,+35
 * </EFFECT>
 * A strong steal effect that applies a +35 percent modifier to
 * a stealable items base steal chance and ends the action on the
 * first steal success 
 *
 * <EFFECT>
 * STEALONE
 * </EFFECT>
 * A generic steal skill effect that uses a stealable items base
 * steal chance and ends the action on the first steal success
 *
 * ==================================================================
 * Stealable Items
 * ==================================================================
 * 
 * Add the following tags to an enemy entry to define the items that
 * can be stolen from that enemy
 *
 * <STEALABLE>
 * itemName,number,basepercent
 * itemName,number,basepercent
 * ...
 * </STEALABLE>
 *
 * itemName : is the name of the item that can be stolen
 * number : is the number of items for this entry that can be stolen
 *          over the course of the battle
 * basepercent : is the base percentage steal chance for this entry
 *
 * Note that the number of items in an entry as indicated by the
 * number field are not the number of items that are stolen on a
 * successfull steal attempt, but the number of that entry type
 * that can be stolen over the course of the battle.  A steal
 * attempt will only ever result in stealing one item per entry.
 *
 * Also note that items lower in the list of entry have a much lower
 * chance of steal than the basepercent value indicates for the
 * STEALONE skills. These skills would have had to fail on each
 * entry above or have already stolen each of the above items ( up
 * to the number member value of times ) on previous actions.
 *
 *
 * Examples:
 *
 * <STEALABLE>
 * Potion,1,50
 * </STEALABLE>
 * A basic stealable item entry with only a single copy of the item
 * to steal and a base steal chance of 50% success
 *
 *
 * <STEALABLE>
 * Potion,1,75
 * Potion,10,25
 * Magic Water,1,50
 * </STEALABLE>
 * This enemy has one potion that has a 75% chance of being stolen
 * 10 potions that have a 25% chance of being stolen, and one
 * Magic Water that has a 50% chance of being stolen. After the
 * first potion entry has had a steal success during the battle
 * each successive steal attempt against that enemy will skip that
 * entry and check the second potion entry followed by the 
 * Magic Water entry
 *
 * <STEALABLE>
 * Potion,1000,100
 * Diamond,1,5
 * </STEALABLE>
 * This enemy has a 1000 potions with a base steal chance of 100%
 * and a Diamond with a base steal chance of 5%. This entry might
 * be intended to hide the valuable diamond behind a lot of easily
 * accessible potions from a STEALONE skill effect while giving a
 * STEALALL skill effect a small chance of stealing the diamond.
 * 
 * ==================================================================
 * Skill Examples
 * ==================================================================
 * 
 * Steal - attempts to steal a single item from an enemy
 *  Scope: 1 Enemy, Success: 100%, Hit Type : Certain,
 *  Damage Type : None, Steal Effect (in notes) : STEALONE
 * 
 * Mug   - Attacks an enemy and attempts to steal a single item
 *  Scope: 1 Enemy, Success: 100%, Hit Type : Physical Attack,
 *  Damage Type : HP Damage, Steal Effect ( in notes ) : STEALONE
 *
 * Raid -  attempts to steal each item entry from all enemies
 *  Scope: All Enemies, Success: 100%, Hit Type : Certain,
 *  Damage Type : None, Steal Effect ( innotes ): STEALALL
 */

 // add the steal message types to the TextManager so steal result
 // messages are handled like and look like a normal battle message
Object.defineProperties(TextManager, {
stealSuccess     : TextManager.getter('message', 'stealSuccess'),
stealMiss        : TextManager.getter('message', 'stealMiss'),
stealNothing     : TextManager.getter('message', 'stealNothing'),
});


//-----------------------------------------------------------------------------
// Stealable - new
//
// The object class that defines a stealable item.
function Stealable(itemId, num, percent) {
    this._itemId = itemId || 0;    
    this._num = num || 0;
    this._percent = (percent || 0);
};

Stealable.prototype.canSteal = function() {
  return this._num > 0;
};

Stealable.prototype.steal = function(modifier) {
  var rand = Math.random();
  // use $gameMessage.add('') here to debug steal math and item entry
  if ((this._num > 0 )&& (rand > (1.0-(this._percent+modifier)*0.01))) {
    this._num -= 1;
    return this._itemId;
  }
  return 0;
};

//-----------------------------------------------------------------------------
// Stealable_Handler - new
//
// The object class for handling stealable items per enemy battler.
function Stealable_Handler() {this.initialize()};

Stealable_Handler.prototype.initialize = function() {
  this._stealable = [];
  this._stolen = [];
};

Stealable_Handler.prototype.add = function(itemId, num, percent) {
    if (itemId > 0) {
        var stealable = new Stealable(itemId, num, percent);
        this._stealable.push(stealable);
    }
};

Stealable_Handler.prototype.canSteal = function() {
    for (n = 0; n < this._stealable.length; n++) {        
        if(this._stealable[n].canSteal()) {
            return true;
        }
    }
    return false;
};

Stealable_Handler.prototype.stealOne = function(modifier) {
        var ids = [];
        var id = 0;
        for (n = 0; n < this._stealable.length; n++) {
            id = this._stealable[n].steal(modifier);
            if(id > 0) {
                ids.push(id);
                break;
            }
        }
        return ids;
};

Stealable_Handler.prototype.stealAll = function(modifier) {
        var ids = [];
        var id;
        for (n = 0; n < this._stealable.length; n++) {
            id = this._stealable[n].steal(modifier);
            if(id > 0) {
                ids.push(id);
            }
        }
        return ids;
};


//-----------------------------------------------------------------------------
// StealPluginLoader - new
//
// loads the steal plugin
function StealPluginLoader() {
  this.initialize();  
};

StealPluginLoader.prototype.initialize = function () {
  this._isloaded = false;
};

StealPluginLoader.prototype.isLoaded = function () {
    return this._isloaded;
};

StealPluginLoader.prototype.loadData = function () {
    this.parseEnemies();
    this.parseSkills();
    this.addDisplayTerms();
    this._isloaded = true;
};

StealPluginLoader.prototype.addDisplayTerms = function () {
    $dataSystem.terms.messages['stealSuccess']='Stole %1 from %2!';
    $dataSystem.terms.messages['stealMiss']='Failed to steal from %1!';
    $dataSystem.terms.messages['stealNothing']='%1 has nothing to steal!';
};

StealPluginLoader.prototype.parseSkills = function () {
var skills = $dataSkills;
    for (var n = 1; n < skills.length; n++) {
        var obj = skills[n];
        var noteS1 = /<(?:EFFECT)>/i;
        var noteS2 = /<\/(?:EFFECT)>/i;
        var stealone = /(?:STEALONE)/i;
        var stealall = /(?:STEALALL)/i;
        var notedata = obj.note.split(/[\r\n]+/);
        for (var i = 0; i < notedata.length; i++) {
            var line = notedata[i];
            if (line.match(noteS1)) {
                for(var j=i+1; j < notedata.length; j++) {
                    line = notedata[j];
                    if (line.match(noteS2)) {
                        break;
                    }                    
                    if (line.match(stealall)) {
                        var res = line.split(',');
                        var stealPercentMod = Number(res[1] || 0);
                        obj.effects.push({code: Game_Action.EFFECT_STEAL_ALL, 
                                          percentModifier: stealPercentMod});
                    }
                    else if (line.match(stealone)) {
                        var res = line.split(',');
                        var stealPercentMod = Number(res[1] || 0);
                        obj.effects.push({code: Game_Action.EFFECT_STEAL_ONE, 
                                          percentModifier: stealPercentMod});
                    }
                }
            }
        }
    }
};

StealPluginLoader.prototype.parseEnemies = function () {
    var noteS1 = /<(?:STEALABLE)>/i;
    var noteS2 = /<\/(?:STEALABLE)>/i;
    var enemies = $dataEnemies;
    for (var n = 1; n < enemies.length; n++) {
        var obj = enemies[n];
        var notedata = obj.note.split(/[\r\n]+/);
        obj.stealable = [];
        for (var i = 0; i < notedata.length; i++) {
            var line = notedata[i];
            if (line.match(noteS1)) {
               for(var j=i+1; j < notedata.length; j++) {
                    line = notedata[j];
                    if (line.match(noteS2)) {
                       break;
                    }
                    var res = line.split(',');
                    var itemName = res[0];
                    var num = Number(res[1] || 0);
                    var per = Number(res[2] || 0);
                    var id = 0;
                    for(var k = 0; k < $dataItems.length; k++) {
                        var item = $dataItems[k];
                        if (item && ( item.name == itemName)) {
                            id = k;
                            break;
                        }
                    }
                    if (id != 0) {
                        obj.stealable.push(new Stealable(id, num, per));
                    }
               }
            } 
        }
    }
};

//-----------------------------------------------------------------------------
// DataManager - modified
//
// overloading isDatabaseLoaded to initialize the steal plugin
DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;

DataManager.stealPlugin = new StealPluginLoader();

DataManager.isDatabaseLoaded = function() {
    if (!DataManager_isDatabaseLoaded.call(this)) return false;
    if(!this.stealPlugin.isLoaded()) {        
        this.stealPlugin.loadData();
    }
    return true;
};

//-----------------------------------------------------------------------------
// Game_Enemy - modified
//
// adding steal functions to interface with the stealable handler item
Game_Enemy.prototype.canSteal = function() {
    if (this.stealable && this.stealable.canSteal()) {
        return true;
    }
    return false;
};

Game_Enemy.prototype.stealOne = function(modifier) {
    return this.stealable.stealOne(modifier);    
};

Game_Enemy.prototype.stealAll = function(modifier) {
    return this.stealable.stealAll(modifier);
};
        
Game_Enemy.prototype.recoverAllOrg = Game_Enemy.prototype.recoverAll;
Game_Enemy.prototype.recoverAll2 = function() {
    this.recoverAllOrg();
    this.stealable = new Stealable_Handler();
    for(n = 0; n < this.enemy().stealable.length; n++)
    {
        var stealItem = this.enemy().stealable[n];
        this.stealable.add(stealItem._itemId, stealItem._num, stealItem._percent);
    }    
}
Game_Enemy.prototype.recoverAll = Game_Enemy.prototype.recoverAll2;

//-----------------------------------------------------------------------------
// Game_ActionResult - modified
//
// modified clear function to track robbed and robmissed status
Game_ActionResult.prototype.clearOrg = Game_ActionResult.prototype.clear;
Game_ActionResult.prototype.clear2 = function() {
    this.clearOrg();
    this.robbed = false;
    this.robmissed = false;
    this.stolen = [];
}
Game_ActionResult.prototype.clear = Game_ActionResult.prototype.clear2;

//-----------------------------------------------------------------------------
// Window_BattleLog - modified
//
// modified displayActionResults and added display steal function to display
// steal messages during battle
Window_BattleLog.prototype.displaySteal = function(target) {
    if (!target.result().robbed) {
        return;
    }
    if(target.result().robmissed) {
        this.push('addText', TextManager.stealMiss.format(target.name()));   
        return;
    }
    var stolenItems = target.result().stolen;
    if (stolenItems.length == 0) {
        this.push('addText', TextManager.stealNothing.format(target.name()));   
        return;
    }

    for(n = 0; n < stolenItems.length; n++) {
        this.push('addText', TextManager.stealSuccess.format($dataItems[stolenItems[n]].name, target.name()));
    }        
    return;
};


Window_BattleLog.prototype.displayActionResults = function(subject, target) {
    if (target.result().used) {
        this.push('pushBaseLine');
        this.displayCritical(target);
        this.push('popupDamage', target);
        this.push('popupDamage', subject);
        this.displayDamage(target);
        this.displayAffectedStatus(target);
        this.displaySteal(target);
        this.displayFailure(target);
        this.push('waitForNewLine');
        this.push('popBaseLine');
    }
};

//-----------------------------------------------------------------------------
// Game_Action - modified
//
// added steal effect types and modified applyItemEffect to check for these new
// effect types. Added itemEffectSteal function to handle steal effects
Game_Action.EFFECT_STEAL = 101;
Game_Action.EFFECT_STEAL_ALL = 102;

Game_Action.prototype.itemEffectSteal = function(target,effect,stealall) {
    // go through target and roll against per chance to steal items
    // check to see if there is anything to steal
    target.result().robbed = true;
    if (target.canSteal()) {       
        var stolenItems;
        if (!stealall) {
            stolenItems = target.stealOne(effect.percentModifier);            
        }
        else {
            stolenItems = target.stealAll(effect.percentModifier);
        }

        if (stolenItems.length == 0) {
            target.result().robmissed = true;
        }
        for (var n = 0; n < stolenItems.length; n++) {
            target.result().stolen.push(stolenItems[n]);
            $gameParty.gainItem($dataItems[stolenItems[n]],1);
        }

    }
    this.makeSuccess(target);
};

Game_Action.prototype.applyItemEffectOrg = Game_Action.prototype.applyItemEffect;
Game_Action.prototype.applyItemEffect2 = function(target, effect) {
    this.applyItemEffectOrg(target, effect);
    switch (effect.code) {
    case Game_Action.EFFECT_STEAL_ONE:      
        this.itemEffectSteal(target, effect, false);
        break;
    case Game_Action.EFFECT_STEAL_ALL:
        this.itemEffectSteal(target, effect, true);
        break;
    }
};
Game_Action.prototype.applyItemEffect = Game_Action.prototype.applyItemEffect2;
