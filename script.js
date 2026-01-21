// --- Game State ---
let state = {
    gold: 0,
    level: 1,
    monsterHp: 10,
    monsterMaxHp: 10,
    dps: 0,
    clickDmg: 1,
    purchased: {},
    adminUnlocked: false
};

const UPGRADES = [
    { id: 1, name: "Rusty Sword", cost: 15, dmg: 1, type: 'click' },
    { id: 2, name: "Apprentice Mage", cost: 50, dmg: 2, type: 'dps' },
    { id: 3, name: "Sharpening Stone", cost: 200, dmg: 5, type: 'click' },
    { id: 4, name: "Warrior Guild", cost: 500, dmg: 15, type: 'dps' },
    { id: 5, name: "Dragon Slayer", cost: 2000, dmg: 50, type: 'dps' }
];

// --- Core Logic ---
function init() {
    renderShop();
    gameLoop();
    updateUI();
}

function updateUI() {
    document.getElementById('gold').textContent = Math.floor(state.gold);
    document.getElementById('dps').textContent = state.dps;
    document.getElementById('level').textContent = state.level;
    document.getElementById('current-hp').textContent = Math.ceil(state.monsterHp);
    document.getElementById('max-hp').textContent = state.monsterMaxHp;
    
    const percent = (state.monsterHp / state.monsterMaxHp) * 100;
    document.getElementById('hp-bar').style.width = percent + "%";
}

function dealDamage(amount, isClick) {
    state.monsterHp -= amount;
    
    if (isClick) spawnText(`-${amount}`, event.pageX, event.pageY);

    if (state.monsterHp <= 0) {
        killMonster();
    }
    updateUI();
}

function killMonster() {
    // Reward gold
    let reward = state.level * 2;
    if (state.level % 10 === 0) reward *= 5; // Boss bonus
    
    state.gold += reward;
    state.level++;
    
    // Spawn new monster
    state.monsterMaxHp = Math.floor(10 * Math.pow(1.15, state.level));
    state.monsterHp = state.monsterMaxHp;
    
    // Change name/sprite logic
    const monsterName = document.getElementById('monster-name');
    if (state.level % 10 === 0) {
        monsterName.textContent = "BOSS MONSTER";
        monsterName.style.color = "red";
    } else {
        monsterName.textContent = "Monster Lvl " + state.level;
        monsterName.style.color = "white";
    }
}

// --- Shop ---
function renderShop() {
    const list = document.getElementById('upgrades-list');
    list.innerHTML = '';
    UPGRADES.forEach(up => {
        const count = state.purchased[up.id] || 0;
        const currentCost = Math.floor(up.cost * Math.pow(1.2, count));
        
        const card = document.createElement('div');
        card.className = 'upgrade';
        card.innerHTML = `
            <div>
                <strong>${up.name}</strong> (x${count})<br>
                <small>+${up.dmg} ${up.type === 'click' ? 'Click Dmg' : 'DPS'}</small>
            </div>
            <button class="buy-btn" onclick="buyUpgrade(${up.id})" ${state.gold < currentCost ? 'disabled' : ''}>
                Buy: ${currentCost}g
            </button>
        `;
        list.appendChild(card);
    });
}

function buyUpgrade(id) {
    const up = UPGRADES.find(u => u.id === id);
    const count = state.purchased[id] || 0;
    const currentCost = Math.floor(up.cost * Math.pow(1.2, count));

    if (state.gold >= currentCost) {
        state.gold -= currentCost;
        state.purchased[id] = count + 1;
        
        if (up.type === 'click') state.clickDmg += up.dmg;
        else state.dps += up.dmg;
        
        renderShop();
        updateUI();
    }
}

// --- Game Loops ---
function gameLoop() {
    setInterval(() => {
        if (state.dps > 0) {
            dealDamage(state.dps / 10, false);
        }
        // Enable/Disable buy buttons based on gold
        renderShop(); 
    }, 100); 
}

// --- Helpers ---
function spawnText(txt, x, y) {
    const el = document.createElement('div');
    el.className = 'flash-text';
    el.textContent = txt;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

// --- Admin Logic ---
document.getElementById('admin-btn').addEventListener('click', () => {
    document.getElementById('admin-panel').classList.toggle('hidden');
});

document.getElementById('auth-submit').addEventListener('click', () => {
    const val = document.getElementById('auth-input').value;
    if (val.toUpperCase() === 'HEEM') {
        state.gold += 1000000;
        alert("Cheater! Added 1M Gold.");
        updateUI();
    }
});

// Clicker Event
document.getElementById('clicker').addEventListener('click', (e) => {
    dealDamage(state.clickDmg, true);
});

init();
