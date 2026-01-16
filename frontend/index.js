/* Dashboard Bunker AD - API Version */

const API_BASE = '/api';

// --- STATE MANAGEMENT ---
let state = {
    isAuthenticated: false,
    isLoading: true,
    kpis: {
        mrr: 0,
        mrrGoal: 20000,
        activeSubscribers: 0,
    },
    mrrHistory: [],
    clients: [],
    clientActivity: [],
    affiliates: [],
    ui: {
        mrrTimeRange: '12',
        modal: {
            isOpen: false,
            type: null,
            data: null,
        }
    }
};

// --- API FUNCTIONS ---
const api = {
    async fetch(endpoint, options = {}) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (response.status === 401) {
            state.isAuthenticated = false;
            renderApp();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || 'API Error');
        }

        return response.json();
    },

    // Auth
    async login(username, password) {
        return this.fetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },

    async logout() {
        return this.fetch('/auth/logout', { method: 'POST' });
    },

    async checkAuth() {
        return this.fetch('/auth/me');
    },

    // KPIs
    async getKpis() {
        return this.fetch('/kpis');
    },

    async updateKpis(data) {
        return this.fetch('/kpis', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    // Clients
    async getClients() {
        return this.fetch('/clients');
    },

    async createClient(data) {
        return this.fetch('/clients', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateClient(id, data) {
        return this.fetch(`/clients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteClient(id) {
        return this.fetch(`/clients/${id}`, { method: 'DELETE' });
    },

    // Affiliates
    async getAffiliates() {
        return this.fetch('/affiliates');
    },

    async createAffiliate(data) {
        return this.fetch('/affiliates', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateAffiliate(id, data) {
        return this.fetch(`/affiliates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteAffiliate(id) {
        return this.fetch(`/affiliates/${id}`, { method: 'DELETE' });
    },

    // MRR History
    async getMrrHistory() {
        return this.fetch('/mrr-history');
    },

    async createMrrHistory(data) {
        return this.fetch('/mrr-history', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateMrrHistory(id, data) {
        return this.fetch(`/mrr-history/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteMrrHistory(id) {
        return this.fetch(`/mrr-history/${id}`, { method: 'DELETE' });
    },

    // Client Activity
    async getClientActivity() {
        return this.fetch('/client-activity');
    },

    async createClientActivity(data) {
        return this.fetch('/client-activity', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async updateClientActivity(id, data) {
        return this.fetch(`/client-activity/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async deleteClientActivity(id) {
        return this.fetch(`/client-activity/${id}`, { method: 'DELETE' });
    },
};

// --- DATA LOADING ---
const loadAllData = async () => {
    try {
        const [kpis, clients, affiliates, mrrHistory, clientActivity] = await Promise.all([
            api.getKpis(),
            api.getClients(),
            api.getAffiliates(),
            api.getMrrHistory(),
            api.getClientActivity(),
        ]);

        state.kpis = {
            mrr: kpis.mrr,
            mrrGoal: kpis.mrrGoal,
            activeSubscribers: kpis.activeSubscribers,
        };
        state.clients = clients;
        state.affiliates = affiliates;
        state.mrrHistory = mrrHistory;
        state.clientActivity = clientActivity;
        state.isLoading = false;
    } catch (error) {
        console.error('Failed to load data:', error);
        state.isLoading = false;
    }
};

// --- UTILITY FUNCTIONS ---
const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(value) + ' €';
};

const getAffiliatePayout = (affiliate) => {
    if (affiliate.monthlyPayoutOverride) {
        return affiliate.monthlyPayoutOverride;
    }
    const referredClients = state.clients.filter(client => affiliate.referred.includes(client.name));
    const totalSpent = referredClients.reduce((sum, client) => sum + client.totalSpent, 0);
    return totalSpent * 0.30;
};

// --- DOM ELEMENTS ---
const app = document.getElementById('app');

// --- SVG ICONS ---
const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
const addIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;

// --- RENDER FUNCTIONS ---
const renderApp = () => {
    if (!state.isAuthenticated) {
        renderLoginPage();
        return;
    }

    if (state.isLoading) {
        app.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Chargement...</p>
            </div>
        `;
        return;
    }

    const { mrr, mrrGoal, activeSubscribers } = state.kpis;
    const mrrPercentage = Math.min((mrr / mrrGoal) * 100, 100);

    let progressBarClass = 'blue';
    if (mrrPercentage < 40) {
        progressBarClass = 'red';
    } else if (mrrPercentage < 80) {
        progressBarClass = 'orange';
    }

    app.innerHTML = `
        <header>
            <h1>Dashboard Bunker AD</h1>
            <button class="btn btn-secondary" id="logout-btn">Déconnexion</button>
        </header>
        <main class="dashboard-grid">
            <div class="card kpi-card">
                <div class="card-header">
                    <h3>MRR Actuel</h3>
                    <div class="card-header-actions">
                        <button class="icon-btn" data-modal-type="kpis" data-modal-data='{"mrr": ${mrr}}'>${editIcon}</button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="stat-value">${formatCurrency(mrr)}</div>
                </div>
            </div>
            <div class="card kpi-card">
                <div class="card-header">
                    <h3>Objectif MRR</h3>
                     <div class="card-header-actions">
                        <button class="icon-btn" data-modal-type="kpis" data-modal-data='{"mrrGoal": ${mrrGoal}}'>${editIcon}</button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="stat-value">${formatCurrency(mrrGoal)}</div>
                    <div class="progress-bar">
                        <div class="progress ${progressBarClass}" style="width: ${mrrPercentage}%;"></div>
                    </div>
                </div>
            </div>
            <div class="card kpi-card">
                <div class="card-header">
                    <h3>Abonnés Actifs</h3>
                     <div class="card-header-actions">
                        <button class="icon-btn" data-modal-type="kpis" data-modal-data='{"activeSubscribers": ${activeSubscribers}}'>${editIcon}</button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="stat-value">${activeSubscribers}</div>
                </div>
            </div>
            ${renderMrrChart()}
            ${renderClientActivityTable()}
            ${renderClientTable()}
            ${renderAffiliateTable()}
            ${renderPayoutTable()}
        </main>
        ${state.ui.modal.isOpen ? renderModal() : ''}
    `;

    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
    if (state.ui.modal.isOpen) attachModalEventListeners();
    attachChartEventListeners();
};

const renderLoginPage = () => {
    app.innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <h1>Dashboard Bunker AD</h1>
                <form id="login-form">
                    <div class="form-group">
                        <label for="username">Nom d'utilisateur</label>
                        <input type="text" id="username" name="username" required autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label for="password">Mot de passe</label>
                        <input type="password" id="password" name="password" required autocomplete="current-password">
                    </div>
                    <div id="login-error" class="login-error" style="display: none;"></div>
                    <button type="submit" class="btn btn-primary btn-full">Se connecter</button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
};

const renderMrrChart = () => {
    const dataPoints = state.mrrHistory.slice(-state.ui.mrrTimeRange);
    if (dataPoints.length < 2) return `<div class="card chart-card"><div class="card-body">Données insuffisantes pour afficher le graphique.</div></div>`;

    const labels = dataPoints.map(d => new Date(d.month).toLocaleString('fr-FR', { month: 'short' }));
    const values = dataPoints.map(d => d.value);

    const svgWidth = 1000;
    const svgHeight = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const maxVal = Math.max(...values);
    const minVal = 0;

    const toSvgX = (v, i) => margin.left + (i / (values.length - 1)) * width;
    const toSvgY = v => margin.top + height - ((v - minVal) / (maxVal - minVal)) * height;

    const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(v, i)} ${toSvgY(v)}`).join(' ');
    const areaPath = `${path} V ${toSvgY(minVal)} L ${toSvgX(values[0], 0)} ${toSvgY(minVal)} Z`;

    const xGridLines = labels.map((_, i) => `<line x1="${toSvgX(0,i)}" y1="${margin.top}" x2="${toSvgX(0,i)}" y2="${height + margin.top}" stroke="${i === 0 || i === labels.length - 1 ? 'transparent' : 'var(--border-color)'}" stroke-dasharray="2,3" />`).join('');
    const yGridLines = Array.from({length: 5}).map((_, i) => {
        const y = margin.top + (i/4) * height;
        return `<line x1="${margin.left}" y1="${y}" x2="${width+margin.left}" y2="${y}" stroke="var(--border-color)" stroke-dasharray="2,3" />`;
    }).join('');

    const yAxisLabels = Array.from({length: 5}).map((_, i) => {
        const val = minVal + (i/4) * (maxVal - minVal);
        return `<text x="${margin.left - 10}" y="${margin.top + height - (i/4) * height + 4}" text-anchor="end">${Math.round(val/1000)}K</text>`;
    }).join('');

    const xAxisLabels = labels.map((label, i) => `<text x="${toSvgX(0, i)}" y="${svgHeight - 5}" text-anchor="middle">${label}</text>`).join('');

    return `
        <div class="card chart-card">
            <div class="card-header">
                <h3>Évolution du MRR</h3>
                <div class="card-header-actions">
                     <select class="time-range-selector" id="time-range-selector" value="${state.ui.mrrTimeRange}">
                        <option value="3" ${state.ui.mrrTimeRange === '3' ? 'selected' : ''}>3 derniers mois</option>
                        <option value="6" ${state.ui.mrrTimeRange === '6' ? 'selected' : ''}>6 derniers mois</option>
                        <option value="12" ${state.ui.mrrTimeRange === '12' ? 'selected' : ''}>12 derniers mois</option>
                    </select>
                    <button class="icon-btn" data-modal-type="mrrHistory">${editIcon}</button>
                </div>
            </div>
            <div class="card-body">
                <svg viewBox="0 0 ${svgWidth} ${svgHeight}" id="mrr-chart">
                    <g class="grid y-grid">${yGridLines}</g>
                    <g class="grid x-grid">${xGridLines}</g>
                    <g class="axis y-axis">${yAxisLabels}</g>
                    <g class="axis x-axis">${xAxisLabels}</g>
                    <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:var(--primary-color);stop-opacity:0.4"/>
                            <stop offset="100%" style="stop-color:var(--primary-color);stop-opacity:0"/>
                        </linearGradient>
                    </defs>
                    <path class="area" d="${areaPath}" fill="url(#areaGradient)"></path>
                    <path class="line mrr" d="${path}"></path>

                    <!-- Interactive elements -->
                    <g class="tooltip" style="visibility: hidden;">
                        <line class="hover-line" y1="${margin.top}" y2="${height + margin.top}"></line>
                        <circle class="hover-circle" r="5"></circle>
                        <rect class="tooltip-bg" width="120" height="50" rx="5"></rect>
                        <text class="tooltip-text" x="10" y="20">Date</text>
                        <text class="tooltip-value" x="10" y="40">Value</text>
                    </g>
                </svg>
            </div>
        </div>
    `;
};


const renderClientTable = () => `
    <div class="card table-card">
        <div class="card-header">
            <h3>Gestion des Clients</h3>
            <div class="card-header-actions">
                <button class="icon-btn" data-modal-type="client" data-modal-data='{}'>${addIcon}</button>
            </div>
        </div>
        <div class="card-body" style="padding:0;">
            <div class="table-container">
                <table>
                    <thead><tr><th>Nom du client</th><th>Téléphone</th><th>Date d'intégration</th><th>ID Compte Pub</th><th>Total Dépensé</th><th></th></tr></thead>
                    <tbody>
                        ${state.clients.map(c => `
                            <tr>
                                <td>${c.name}</td>
                                <td>${c.phone || 'N/A'}</td>
                                <td>${c.integrationDate}</td>
                                <td>${c.adAccountId}</td>
                                <td>${formatCurrency(c.totalSpent)}</td>
                                <td class="actions-cell">
                                    <button class="icon-btn" data-modal-type="client" data-modal-data='${JSON.stringify(c).replace(/'/g, "&#39;")}'>${editIcon}</button>
                                    <button class="icon-btn delete-btn" data-type="client" data-id="${c.id}">${deleteIcon}</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
`;

const renderClientActivityTable = () => `
    <div class="card table-card">
        <div class="card-header">
            <h3>Activité Clients (Mensuel)</h3>
            <div class="card-header-actions">
                <button class="icon-btn" data-modal-type="clientActivity">${editIcon}</button>
            </div>
        </div>
        <div class="card-body" style="padding:0;">
            <div class="table-container">
                <table>
                    <thead><tr><th>Mois</th><th>Clients Gagnés</th><th>Clients Perdus</th></tr></thead>
                    <tbody>
                        ${[...state.clientActivity].sort((a, b) => new Date(b.month) - new Date(a.month)).map(a => `
                            <tr>
                                <td>${new Date(a.month + '-02').toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</td>
                                <td style="color: var(--accent-color-1);">+${a.gained}</td>
                                <td style="color: var(--accent-color-2);">${-a.lost}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
`;


const renderAffiliateTable = () => `
    <div class="card table-card">
        <div class="card-header">
            <h3>Suivi des Affiliés</h3>
            <div class="card-header-actions">
                <button class="icon-btn" data-modal-type="affiliate" data-modal-data='{}'>${addIcon}</button>
            </div>
        </div>
        <div class="card-body" style="padding:0;">
            <div class="table-container">
                <table>
                    <thead><tr><th>Nom de l'affilié</th><th>Clients Parrainés</th><th></th></tr></thead>
                    <tbody>
                        ${state.affiliates.map(a => `
                            <tr>
                                <td>${a.name}</td>
                                <td>${a.referred.join(', ')}</td>
                                <td class="actions-cell">
                                    <button class="icon-btn" data-modal-type="affiliate" data-modal-data='${JSON.stringify(a).replace(/'/g, "&#39;")}'>${editIcon}</button>
                                    <button class="icon-btn delete-btn" data-type="affiliate" data-id="${a.id}">${deleteIcon}</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
`;

const renderPayoutTable = () => `
    <div class="card table-card">
        <div class="card-header">
            <h3>Paiements des Affiliés</h3>
        </div>
        <div class="card-body" style="padding:0;">
            <div class="table-container">
                <table>
                    <thead><tr><th>Nom de l'affilié</th><th>IBAN</th><th>Paiement ce mois-ci</th><th></th></tr></thead>
                    <tbody>
                        ${state.affiliates.map(a => `
                            <tr>
                                <td>${a.name}</td>
                                <td>${a.iban}</td>
                                <td>${formatCurrency(getAffiliatePayout(a))}</td>
                                <td class="actions-cell">
                                     <button class="icon-btn" data-modal-type="payout" data-modal-data='${JSON.stringify(a).replace(/'/g, "&#39;")}'>${editIcon}</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
`;

// --- MODAL RENDERING ---
const renderModal = () => {
    const { type, data } = state.ui.modal;
    let title = '', body = '', footer = '';
    const isForm = type !== 'confirmDelete';

    switch (type) {
        case 'kpis':
            title = 'Modifier les KPIs';
            body = `
                <div class="form-group">
                    <label for="mrr">MRR Actuel</label>
                    <input type="number" id="mrr" name="mrr" value="${state.kpis.mrr}">
                </div>
                <div class="form-group">
                    <label for="mrrGoal">Objectif MRR</label>
                    <input type="number" id="mrrGoal" name="mrrGoal" value="${state.kpis.mrrGoal}">
                </div>
                <div class="form-group">
                    <label for="activeSubscribers">Abonnés Actifs</label>
                    <input type="number" id="activeSubscribers" name="activeSubscribers" value="${state.kpis.activeSubscribers}">
                </div>
            `;
            break;
        case 'mrrHistory':
            title = "Modifier l'historique du MRR";
            body = `
                <h4>Entrées existantes</h4>
                <div id="mrr-history-entries">
                ${state.mrrHistory.map((entry) => `
                    <div class="form-group-inline" data-id="${entry.id}">
                        <label>${new Date(entry.month + '-02').toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</label>
                        <input type="number" name="mrr-value-${entry.id}" value="${entry.value}">
                    </div>
                `).join('')}
                </div>
                <hr/>
                <h4>Ajouter une entrée</h4>
                <div id="new-mrr-entries-container"></div>
                <button type="button" class="btn btn-secondary" id="add-mrr-entry-btn">${addIcon} Ajouter un mois</button>
            `;
            break;
        case 'clientActivity':
            title = "Modifier l'Activité Clients";
            body = `
                <h4>Entrées existantes</h4>
                <div id="client-activity-entries">
                ${state.clientActivity.map((entry) => `
                    <div class="form-group-inline activity-entry" data-id="${entry.id}">
                        <label>${new Date(entry.month + '-02').toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</label>
                        <input type="number" name="gained-${entry.id}" value="${entry.gained}" placeholder="Gagnés">
                        <input type="number" name="lost-${entry.id}" value="${entry.lost}" placeholder="Perdus">
                    </div>
                `).join('')}
                </div>
                <hr/>
                <h4>Ajouter une entrée</h4>
                <div id="new-client-activity-container"></div>
                <button type="button" class="btn btn-secondary" id="add-client-activity-btn">${addIcon} Ajouter un mois</button>
            `;
            break;
        case 'client':
            const isNewClient = !data.id;
            title = isNewClient ? 'Ajouter un client' : 'Modifier le client';
            body = `
                <input type="hidden" name="id" value="${data.id || ''}">
                <div class="form-group">
                    <label for="name">Nom du client</label>
                    <input type="text" id="name" name="name" value="${data.name || ''}" required>
                </div>
                <div class="form-group">
                    <label for="phone">Numéro de téléphone</label>
                    <input type="tel" id="phone" name="phone" value="${data.phone || ''}">
                </div>
                <div class="form-group">
                    <label for="integrationDate">Date d'intégration</label>
                    <input type="date" id="integrationDate" name="integrationDate" value="${data.integrationDate || ''}" required>
                </div>
                <div class="form-group">
                    <label for="adAccountId">ID Compte Publicitaire</label>
                    <input type="text" id="adAccountId" name="adAccountId" value="${data.adAccountId || ''}" required>
                </div>
                <div class="form-group">
                    <label for="totalSpent">Total Dépensé</label>
                    <input type="number" id="totalSpent" name="totalSpent" value="${data.totalSpent || 0}" required>
                </div>
            `;
            break;
        case 'affiliate':
            const isNewAffiliate = !data.id;
            title = isNewAffiliate ? 'Ajouter un affilié' : "Modifier l'affilié";
            const clientCheckboxes = state.clients.map(c => `
                <div class="checkbox-item">
                    <input type="checkbox" id="client-${c.id}" name="referred" value="${c.name}" ${data.referred && data.referred.includes(c.name) ? 'checked' : ''}>
                    <label for="client-${c.id}">${c.name}</label>
                </div>
            `).join('');
            body = `
                <input type="hidden" name="id" value="${data.id || ''}">
                <div class="form-group">
                    <label for="name">Nom de l'affilié</label>
                    <input type="text" id="name" name="name" value="${data.name || ''}" required>
                </div>
                 <div class="form-group">
                    <label for="iban">IBAN</label>
                    <input type="text" id="iban" name="iban" value="${data.iban || ''}" required>
                </div>
                <div class="form-group">
                    <label>Clients Parrainés</label>
                    <div class="checkbox-list-container">${clientCheckboxes || '<p style="color: var(--text-muted-color);">Aucun client disponible</p>'}</div>
                </div>
            `;
            break;
        case 'payout':
            title = `Modifier le paiement de ${data.name}`;
            body = `
                <input type="hidden" name="id" value="${data.id}">
                 <div class="form-group">
                    <label for="iban">IBAN</label>
                    <input type="text" id="iban" name="iban" value="${data.iban || ''}" required>
                </div>
                <div class="form-group">
                    <label for="monthlyPayoutOverride">Paiement mensuel fixe</label>
                    <input type="number" id="monthlyPayoutOverride" name="monthlyPayoutOverride" value="${data.monthlyPayoutOverride || ''}" placeholder="Optionnel">
                    <small>Laissez vide pour calculer automatiquement (30% des dépenses des clients parrainés).</small>
                </div>
            `;
            break;
        case 'confirmDelete':
            title = 'Confirmer la suppression';
            body = `<p>Êtes-vous sûr de vouloir supprimer <strong>${data.name}</strong> ?<br>Cette action est irréversible.</p>`;
            break;
    }

    if (type === 'confirmDelete') {
        footer = `
            <button type="button" class="btn btn-secondary" id="cancel-modal-btn">Annuler</button>
            <button type="button" class="btn btn-danger" id="confirm-delete-btn">Confirmer la suppression</button>
        `;
    } else {
        footer = `
            <button type="button" class="btn btn-secondary" id="cancel-modal-btn">Annuler</button>
            <button type="submit" class="btn btn-primary">Sauvegarder</button>
        `;
    }

    return `
        <div class="modal-overlay">
            <div class="modal">
                ${isForm ? `<form id="modal-form">` : ''}
                    <input type="hidden" name="formType" value="${type}">
                    <div class="modal-header">
                        <h2>${title}</h2>
                        <button type="button" class="icon-btn" id="close-modal-btn">&times;</button>
                    </div>
                    <div class="modal-body">${body}</div>
                    <div class="modal-footer">${footer}</div>
                ${isForm ? `</form>` : ''}
            </div>
        </div>
    `;
};


// --- EVENT LISTENERS & HANDLERS ---
const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;
    const errorDiv = document.getElementById('login-error');

    try {
        await api.login(username, password);
        state.isAuthenticated = true;
        state.isLoading = true;
        renderApp();
        await loadAllData();
        renderApp();
    } catch (error) {
        errorDiv.textContent = 'Identifiants incorrects';
        errorDiv.style.display = 'block';
    }
};

const handleLogout = async () => {
    try {
        await api.logout();
    } catch (error) {
        console.error('Logout error:', error);
    }
    state.isAuthenticated = false;
    renderApp();
};

const openModal = (type, data) => {
    state.ui.modal = { isOpen: true, type, data };
    renderApp();
};

const closeModal = () => {
    state.ui.modal = { isOpen: false, type: null, data: null };
    renderApp();
};

const handleFormSubmit = async (form) => {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        switch (data.formType) {
            case 'kpis':
                await api.updateKpis({
                    mrr: parseFloat(data.mrr),
                    mrrGoal: parseFloat(data.mrrGoal),
                    activeSubscribers: parseInt(data.activeSubscribers),
                });
                break;
            case 'mrrHistory':
                // Update existing entries
                for (const entry of state.mrrHistory) {
                    const newValue = parseFloat(formData.get(`mrr-value-${entry.id}`));
                    if (newValue !== entry.value) {
                        await api.updateMrrHistory(entry.id, { value: newValue });
                    }
                }
                // Add new entries
                const newMonths = formData.getAll('new-mrr-month');
                const newValues = formData.getAll('new-mrr-value');
                for (let i = 0; i < newMonths.length; i++) {
                    if (newMonths[i] && newValues[i]) {
                        await api.createMrrHistory({
                            month: newMonths[i],
                            value: parseFloat(newValues[i]),
                        });
                    }
                }
                break;
            case 'clientActivity':
                // Update existing entries
                for (const entry of state.clientActivity) {
                    const newGained = parseInt(formData.get(`gained-${entry.id}`), 10);
                    const newLost = parseInt(formData.get(`lost-${entry.id}`), 10);
                    if (newGained !== entry.gained || newLost !== entry.lost) {
                        await api.updateClientActivity(entry.id, { gained: newGained, lost: newLost });
                    }
                }
                // Add new entries
                const newActivityMonths = formData.getAll('new-activity-month');
                const newGainedList = formData.getAll('new-activity-gained');
                const newLostList = formData.getAll('new-activity-lost');
                for (let i = 0; i < newActivityMonths.length; i++) {
                    if (newActivityMonths[i] && newGainedList[i] && newLostList[i]) {
                        await api.createClientActivity({
                            month: newActivityMonths[i],
                            gained: parseInt(newGainedList[i], 10),
                            lost: parseInt(newLostList[i], 10),
                        });
                    }
                }
                break;
            case 'client':
                const clientData = {
                    name: data.name,
                    phone: data.phone,
                    integrationDate: data.integrationDate,
                    adAccountId: data.adAccountId,
                    totalSpent: parseFloat(data.totalSpent),
                };
                if (data.id) {
                    await api.updateClient(parseInt(data.id), clientData);
                } else {
                    await api.createClient(clientData);
                }
                break;
            case 'affiliate':
                const affiliateData = {
                    name: data.name,
                    iban: data.iban,
                    referred: formData.getAll('referred'),
                };
                if (data.id) {
                    const existingAffiliate = state.affiliates.find(a => a.id === parseInt(data.id));
                    affiliateData.monthlyPayoutOverride = existingAffiliate?.monthlyPayoutOverride;
                    await api.updateAffiliate(parseInt(data.id), affiliateData);
                } else {
                    await api.createAffiliate(affiliateData);
                }
                break;
            case 'payout':
                await api.updateAffiliate(parseInt(data.id), {
                    iban: data.iban,
                    monthlyPayoutOverride: data.monthlyPayoutOverride ? parseFloat(data.monthlyPayoutOverride) : null,
                });
                break;
        }

        closeModal();
        await loadAllData();
        renderApp();
    } catch (error) {
        console.error('Form submit error:', error);
        alert('Erreur lors de la sauvegarde: ' + error.message);
    }
};

const handleDelete = async (type, id) => {
    try {
        if (type === 'client') {
            await api.deleteClient(id);
        } else if (type === 'affiliate') {
            await api.deleteAffiliate(id);
        }

        closeModal();
        await loadAllData();
        renderApp();
    } catch (error) {
        console.error('Delete error:', error);
        alert('Erreur lors de la suppression: ' + error.message);
    }
};


const attachModalEventListeners = () => {
    document.getElementById('close-modal-btn')?.addEventListener('click', closeModal);
    document.getElementById('cancel-modal-btn')?.addEventListener('click', closeModal);
    document.querySelector('.modal-overlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
    document.getElementById('modal-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit(e.target);
    });

    // Specific listeners for MRR history modal
    document.getElementById('add-mrr-entry-btn')?.addEventListener('click', () => {
        const container = document.getElementById('new-mrr-entries-container');
        const entryDiv = document.createElement('div');
        entryDiv.className = 'form-group-inline new-mrr-entry';
        entryDiv.innerHTML = `
            <input type="month" name="new-mrr-month" required>
            <input type="number" name="new-mrr-value" placeholder="MRR" required>
            <button type="button" class="icon-btn remove-btn">&times;</button>
        `;
        container.appendChild(entryDiv);
        entryDiv.querySelector('.remove-btn').addEventListener('click', () => entryDiv.remove());
    });

    // Specific listeners for Client Activity modal
    document.getElementById('add-client-activity-btn')?.addEventListener('click', () => {
        const container = document.getElementById('new-client-activity-container');
        const entryDiv = document.createElement('div');
        entryDiv.className = 'form-group-inline activity-entry new-activity-entry';
        entryDiv.innerHTML = `
            <input type="month" name="new-activity-month" required>
            <input type="number" name="new-activity-gained" placeholder="Gagnés" required>
            <input type="number" name="new-activity-lost" placeholder="Perdus" required>
            <button type="button" class="icon-btn remove-btn">&times;</button>
        `;
        container.appendChild(entryDiv);
        entryDiv.querySelector('.remove-btn').addEventListener('click', () => entryDiv.remove());
    });


    // Listener for the delete confirmation button
    document.getElementById('confirm-delete-btn')?.addEventListener('click', () => {
        const { type, id } = state.ui.modal.data;
        handleDelete(type, id);
    });
};

const attachChartEventListeners = () => {
    const chart = document.getElementById('mrr-chart');
    if (!chart) return;

    const tooltip = chart.querySelector('.tooltip');
    if (!tooltip) return;

    const hoverLine = tooltip.querySelector('.hover-line');
    const hoverCircle = tooltip.querySelector('.hover-circle');
    const tooltipBg = tooltip.querySelector('.tooltip-bg');
    const tooltipText = tooltip.querySelector('.tooltip-text');
    const tooltipValue = tooltip.querySelector('.tooltip-value');

    const dataPoints = state.mrrHistory.slice(-state.ui.mrrTimeRange);

    chart.addEventListener('mousemove', (e) => {
        const svgPoint = pt => {
            const p = chart.createSVGPoint();
            p.x = pt.clientX;
            p.y = pt.clientY;
            return p.matrixTransform(chart.getScreenCTM().inverse());
        };

        const loc = svgPoint(e);
        const margin = { left: 50 };
        const width = 1000 - margin.left - 20;

        const index = Math.round(((loc.x - margin.left) / width) * (dataPoints.length - 1));
        if (index < 0 || index >= dataPoints.length) return;

        const d = dataPoints[index];
        const svgWidth = 1000;
        const svgHeight = 300;
        const chartMargin = { top: 20, right: 20, bottom: 30, left: 50 };
        const chartWidth = svgWidth - chartMargin.left - chartMargin.right;
        const chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;
        const maxVal = Math.max(...dataPoints.map(p => p.value));
        const minVal = 0;

        const toSvgX = (i) => chartMargin.left + (i / (dataPoints.length - 1)) * chartWidth;
        const toSvgY = v => chartMargin.top + chartHeight - ((v - minVal) / (maxVal - minVal)) * chartHeight;

        const x = toSvgX(index);
        const y = toSvgY(d.value);

        tooltip.style.visibility = 'visible';
        hoverLine.setAttribute('x1', x);
        hoverLine.setAttribute('x2', x);
        hoverCircle.setAttribute('cx', x);
        hoverCircle.setAttribute('cy', y);

        tooltipText.textContent = new Date(d.month + '-02').toLocaleString('fr-FR', {month: 'long', year: 'numeric'});
        tooltipValue.textContent = formatCurrency(d.value);

        const tooltipX = x > svgWidth / 2 ? x - 130 : x + 10;
        tooltipBg.setAttribute('x', tooltipX);
        tooltipBg.setAttribute('y', chartMargin.top);
        tooltipText.setAttribute('x', tooltipX + 10);
        tooltipText.setAttribute('y', chartMargin.top + 20);
        tooltipValue.setAttribute('x', tooltipX + 10);
        tooltipValue.setAttribute('y', chartMargin.top + 40);
    });

    chart.addEventListener('mouseleave', () => {
        tooltip.style.visibility = 'hidden';
    });
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is already authenticated
    try {
        const authResult = await api.checkAuth();
        if (authResult.user) {
            state.isAuthenticated = true;
            renderApp();
            await loadAllData();
            renderApp();
        } else {
            state.isLoading = false;
            renderApp();
        }
    } catch (error) {
        state.isLoading = false;
        renderApp();
    }

    document.body.addEventListener('click', (event) => {
        const target = event.target;

        // Handle delete button clicks
        const deleteButton = target.closest('.delete-btn');
        if (deleteButton) {
            const type = deleteButton.dataset.type;
            const id = parseInt(deleteButton.dataset.id, 10);
            if (type && !isNaN(id)) {
                 let item;
                if (type === 'client') {
                    item = state.clients.find(c => c.id === id);
                } else {
                    item = state.affiliates.find(a => a.id === id);
                }
                if(item) {
                    openModal('confirmDelete', { type, id, name: item.name });
                }
            }
            return;
        }

        // Handle modal trigger clicks
        const modalButton = target.closest('[data-modal-type]');
        if (modalButton) {
            const type = modalButton.dataset.modalType;
            const data = modalButton.dataset.modalData ? JSON.parse(modalButton.dataset.modalData) : {};
            openModal(type, data);
            return;
        }
    });

    document.body.addEventListener('change', (event) => {
        const target = event.target;
        if (target instanceof HTMLSelectElement && target.id === 'time-range-selector') {
            state.ui.mrrTimeRange = target.value;
            renderApp();
        }
    });
});
