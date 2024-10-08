import weapons from './weaponList.json';

export interface Weapon {
    name: string;
    description: string;
    rarity: string;
    baseDamage: number;
    useRandom: boolean;
    damageMultiplier: number;
}

interface Player {
    health: number;
    weapon: Weapon;
}

interface GameState {
    player: Player;
    enemy: Player;
    hasRound: boolean;
    hasFought: boolean;
    isGameOver: boolean;
    availableWeaponRerolls: number;
}

export let weaponList: Weapon[] = [];

function getRandomWeapon(): Weapon {
    return weaponList[Math.floor(Math.random() * weaponList.length)];
}

export function getNewGameState(): GameState {

    return {
        player: { health: 10, weapon: getRandomWeapon() },
        enemy: { health: 10, weapon: getRandomWeapon() },
        hasRound: true,
        hasFought: false,
        isGameOver: false,
        availableWeaponRerolls: 2
    };
}

export function init(): GameState {
    weaponList = weapons as Weapon[];

    let playerWeapon = getRandomWeapon();
    let enemyWeapon = getRandomWeapon();

    return getNewGameState();
}

export function calculateDamage(weapon: Weapon): number {
    if (weapon.useRandom) {
        return weapon.damageMultiplier * (Math.floor(Math.random() * weapon.baseDamage) + 1); // Ensuring at least 1 damage
    } else {
        return weapon.damageMultiplier * weapon.baseDamage;
    }
}



export function newRound(hasInit: boolean): GameState {
    if(hasInit) {
        throw new Error('Game not initialized');
    }

    return getNewGameState();
}

function validateGameState(gameState: GameState): void {
    if (!gameState.hasRound) {
        throw new Error('Round not initialized');
    }
    if (gameState.hasFought) {
        throw new Error('Round already played');
    }
}

function adjustHealth(currentHealth: number, damage: number): number {
    let newHealth = currentHealth - damage;
    return Math.max(newHealth, 0); 
}

export function fight(gameState: GameState): GameState {
    validateGameState(gameState);

    let playerDamage = calculateDamage(gameState.player.weapon);
    let enemyDamage = calculateDamage(gameState.enemy.weapon);

    gameState.player.health = adjustHealth(gameState.player.health, enemyDamage);
    gameState.enemy.health = adjustHealth(gameState.enemy.health, playerDamage);

    gameState.hasFought = true;

    if (gameState.player.health === 0) {
        gameState.isGameOver = true; // Player lost
    }
    if (gameState.enemy.health === 0) {
        gameState.isGameOver = true; // Player won
    }

    return gameState;
}

export function rerollWeapon(gameState: GameState): GameState {
    if (gameState.availableWeaponRerolls <= 0) {
        throw new Error('No available rerolls left');
    }
    const newWeapon = getRandomWeapon();

    gameState.player.weapon = newWeapon;
    gameState.availableWeaponRerolls -= 1;

    return gameState;
}