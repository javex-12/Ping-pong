// ui.js - DOM Manipulation
export class UI {
    constructor() {
        this.screens = {
            loading: document.getElementById('loading-screen'),
            home: document.getElementById('home-screen'),
            campaign: document.getElementById('campaign-screen'),
            shop: document.getElementById('shop-screen'),
            game: document.getElementById('game-ui'),
            result: document.getElementById('result-screen')
        };
        this.canvas = document.getElementById('canvas-container');
    }

    show(screenName) {
        Object.values(this.screens).forEach(s => s.classList.add('hidden'));
        this.screens[screenName].classList.remove('hidden');
    }

    updateLoader(percent) {
        document.getElementById('loader-fill').style.width = percent + '%';
        if (percent >= 100) {
            setTimeout(() => {
                this.screens.loading.style.opacity = 0;
                setTimeout(() => this.screens.loading.style.display = 'none', 500);
            }, 500);
        }
    }

    renderCarousel(levels, currentIdx, onSelect) {
        const container = document.getElementById('level-carousel');
        container.innerHTML = '';
        levels.forEach((lvl, idx) => {
            const card = document.createElement('div');
            card.className = `level-card ${idx === currentIdx ? 'active' : ''} ${idx > currentIdx + 1 ? 'locked' : ''}`;
            card.innerHTML = `<h3>${lvl.name}</h3>`;
            if (idx > currentIdx + 1) card.innerHTML += '<small>LOCKED</small>';
            
            card.onclick = () => {
                if (idx > currentIdx + 1) return;
                document.querySelectorAll('.level-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                onSelect(lvl);
            };
            container.appendChild(card);
        });
    }

    updateLevelInfo(lvl) {
        document.getElementById('lvl-name').innerText = lvl.name;
        document.getElementById('lvl-desc').innerText = `${lvl.desc} | Difficulty: ${Math.round((1-lvl.difficulty)*100)}%`;
        document.getElementById('btn-start-level').onclick = () => window.startMatch(lvl);
    }

    renderShop(items, owned, credits, onBuy, onEquip) {
        const list = document.getElementById('shop-list');
        list.innerHTML = '';
        document.getElementById('shop-credits').innerText = credits;

        items.forEach(item => {
            const isOwned = owned.includes(item.id);
            const el = document.createElement('div');
            el.className = `shop-item ${isOwned ? 'owned' : ''}`;
            el.innerHTML = `
                <div class="name">${item.name}</div>
                <div class="price">${isOwned ? 'OWNED' : item.price + ' CR'}</div>
            `;
            el.onclick = () => {
                // Update Preview
                document.getElementById('shop-item-name').innerText = item.name;
                // Update bars
                if (item.stats) {
                    document.getElementById('stat-speed').style.width = item.stats.speed + '%';
                    document.getElementById('stat-control').style.width = item.stats.control + '%';
                    document.getElementById('stat-power').style.width = item.stats.power + '%';
                } else {
                    document.getElementById('stat-speed').style.width = '0%';
                    document.getElementById('stat-control').style.width = '0%';
                    document.getElementById('stat-power').style.width = '0%';
                }

                const btn = document.getElementById('btn-buy-equip');
                btn.disabled = false;
                if (isOwned) {
                    btn.innerText = 'EQUIP';
                    btn.onclick = () => onEquip(item);
                } else {
                    if (credits >= item.price) {
                        btn.innerText = 'BUY';
                        btn.onclick = () => onBuy(item);
                    } else {
                        btn.innerText = 'LAKE FUNDS';
                        btn.disabled = true;
                    }
                }
            };
            list.appendChild(el);
        });
    }

    updateHUD(pScore, eScore) {
        document.getElementById('score-p').innerText = pScore;
        document.getElementById('score-e').innerText = eScore;
    }

    showMatchMessage(text) {
        const msg = document.getElementById('match-message');
        document.getElementById('msg-title').innerText = text;
        msg.classList.remove('hidden');
        msg.classList.add('visible');
        setTimeout(() => {
            msg.classList.remove('visible');
            setTimeout(() => msg.classList.add('hidden'), 200);
        }, 1500);
    }
}