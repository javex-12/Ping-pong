// ui.js - PRO UI Manager
export class UI {
    constructor() {
        this.screens = {
            loading: document.getElementById('loading-screen'),
            home: document.getElementById('home-screen'),
            campaign: document.getElementById('campaign-screen'),
            shop: document.getElementById('shop-screen'),
            game: document.getElementById('game-ui'),
            result: document.getElementById('result-screen'),
            pause: document.getElementById('pause-overlay')
        };
        this.canvas = document.getElementById('canvas-container');
    }

    show(screenName) {
        Object.values(this.screens).forEach(s => s.classList.add('hidden'));
        if (this.screens[screenName]) this.screens[screenName].classList.remove('hidden');
    }

    updateLoader(percent) {
        document.getElementById('loader-fill').style.width = percent + '%';
        if (percent >= 100) {
            setTimeout(() => {
                this.screens.loading.style.opacity = 0;
                setTimeout(() => this.screens.loading.style.display = 'none', 600);
            }, 500);
        }
    }

    renderCarousel(levels, currentIdx, onSelect) {
        const container = document.getElementById('level-carousel');
        container.innerHTML = '';
        levels.forEach((lvl, idx) => {
            const card = document.createElement('div');
            card.className = `level-card ${idx === currentIdx ? 'active' : ''}`;
            card.innerHTML = `<h3>${lvl.name}</h3>`;
            
            card.onclick = () => {
                document.querySelectorAll('.level-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                onSelect(lvl);
            };
            container.appendChild(card);
        });
    }

    updateLevelInfo(lvl) {
        document.getElementById('lvl-name').innerText = lvl.name;
        document.getElementById('lvl-desc').innerText = lvl.desc;
        document.getElementById('btn-start-level').onclick = () => window.startMatch();
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
                document.getElementById('shop-item-name').innerText = item.name;
                // Stats
                if (item.stats) {
                    document.getElementById('stat-speed').style.width = item.stats.speed + '%';
                    document.getElementById('stat-control').style.width = item.stats.control + '%';
                }

                const btn = document.getElementById('btn-buy-equip');
                btn.disabled = false;
                if (isOwned) {
                    btn.innerText = 'EQUIP';
                    btn.onclick = () => onEquip(item);
                } else {
                    if (credits >= item.price) {
                        btn.innerText = 'PURCHASE';
                        btn.onclick = () => onBuy(item);
                    } else {
                        btn.innerText = 'INSUFFICIENT FUNDS';
                        btn.disabled = true;
                    }
                }
            };
            list.appendChild(el);
        });
    }

    updateHUD(p1, p2) {
        document.getElementById('score-p').innerText = p1;
        document.getElementById('score-e').innerText = p2;
    }
}