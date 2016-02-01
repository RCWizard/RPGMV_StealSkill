# RPGMV_StealSkill
Implementation of a steal skill plugin for RPGMaker MV

Download to plugin dir for your game and enable

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
 *  Damage Type : None, Steal Effect ( in notes ) : STEALONE
 *
 * Raid -  attempts to steal each item entry from all enemies
 *  Scope: All Enemies, Success: 100%, Hit Type : Certain,
 *  Damage Type : None, Steal Effect ( innotes ): STEALALL
 */
