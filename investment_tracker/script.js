// Global Variables
let monthlyData = [];
let currentAge = 20; // Starting age

// Tab Management
function showTab(evt, tabName) {
    var i, tabcontent, tabs;

    // Hide all tab content
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }

    // Remove active class from all tabs
    tabs = document.getElementsByClassName("tab");
    for (i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active");
    }

    // Show the selected tab and mark it as active
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// Main Update Function
function updateProjections() {
    const monthlyAmount = parseFloat(document.getElementById('monthlyAmount').value);
    const stockPercent = parseFloat(document.getElementById('stockPercent').value) / 100;
    const bondPercent = parseFloat(document.getElementById('bondPercent').value) / 100;
    const stockReturn = parseFloat(document.getElementById('stockReturn').value) / 100;
    const bondReturn = parseFloat(document.getElementById('bondReturn').value) / 100;

    // Update allocation bar
    updateAllocationBar(stockPercent, bondPercent);

    // Update target percentages in portfolio breakdown
    updateTargetPercentages(stockPercent, bondPercent);

    // Calculate weighted return
    const expectedReturn = (stockReturn * stockPercent) + (bondReturn * bondPercent);
    const expectedDividendYield = 0.025; // ~2.5% average dividend yield

    // Generate all projections
    generateProjections(monthlyAmount, expectedReturn, expectedDividendYield);
    updateScenarios(monthlyAmount);
}

// Update Allocation Bar Visualization
function updateAllocationBar(stockPercent, bondPercent) {
    const stockBar = document.getElementById('stockBar');
    const bondBar = document.getElementById('bondBar');

    stockBar.style.width = (stockPercent * 100) + '%';
    bondBar.style.width = (bondPercent * 100) + '%';
    stockBar.textContent = Math.round(stockPercent * 100) + '% Stocks';
    bondBar.textContent = Math.round(bondPercent * 100) + '% Bonds';
}

// Update Target Percentages
function updateTargetPercentages(stockPercent, bondPercent) {
    document.getElementById('targetStock').textContent = Math.round(stockPercent * 100) + '%';
    document.getElementById('targetBond').textContent = Math.round(bondPercent * 100) + '%';
}

// Generate Long-term Projections
function generateProjections(monthlyAmount, annualReturn, dividendYield) {
    const tbody = document.querySelector('#projectionsTable tbody');
    tbody.innerHTML = '';

    let totalInvested = 0;
    let portfolioValue = 0;
    const monthlyReturn = annualReturn / 12;

    for (let year = 1; year <= 50; year++) {
        const yearlyInvestment = monthlyAmount * 12;
        totalInvested += yearlyInvestment;

        // Calculate portfolio growth for the year
        for (let month = 1; month <= 12; month++) {
            portfolioValue = (portfolioValue + monthlyAmount) * (1 + monthlyReturn);
        }

        const totalGains = portfolioValue - totalInvested;
        const annualGains = portfolioValue * annualReturn;
        const annualDividends = portfolioValue * dividendYield;

        // Create table row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${year}</td>
            <td>${currentAge + year}</td>
            <td>€${formatNumber(totalInvested)}</td>
            <td class="positive">€${formatNumber(portfolioValue)}</td>
            <td class="positive">€${formatNumber(annualGains)}</td>
            <td class="positive">€${formatNumber(totalGains)}</td>
            <td class="positive">€${formatNumber(annualDividends)}</td>
        `;
        tbody.appendChild(row);
    }

    // Update summary cards with final year data
    updateSummaryCards(portfolioValue, totalInvested, dividendYield);
}

// Update Summary Cards
function updateSummaryCards(portfolioValue, totalInvested, dividendYield) {
    document.getElementById('currentValue').textContent = '€' + formatNumber(portfolioValue);
    document.getElementById('totalInvested').textContent = '€' + formatNumber(totalInvested);
    document.getElementById('totalGains').textContent = '€' + formatNumber(portfolioValue - totalInvested);
    document.getElementById('monthlyDividends').textContent = '€' + formatNumber((portfolioValue * dividendYield) / 12);
}

// Update Scenario Analysis
function updateScenarios(monthlyAmount) {
    const scenarios = [
        { return: 0.04, id: 'bear', name: 'Bear Market' },
        { return: 0.06, id: 'mod', name: 'Moderate' },
        { return: 0.08, id: 'bull', name: 'Bull Market' }
    ];

    const totalInvested = monthlyAmount * 12 * 20; // 20 years
    const dividendYield = 0.025; // 2.5% dividend yield

    scenarios.forEach(scenario => {
        const monthlyReturn = scenario.return / 12;
        let portfolioValue = 0;

        // Calculate 20-year growth
        for (let month = 1; month <= 240; month++) { // 20 years = 240 months
            portfolioValue = (portfolioValue + monthlyAmount) * (1 + monthlyReturn);
        }

        const totalGains = portfolioValue - totalInvested;
        const annualDividends = portfolioValue * dividendYield;

        // Update scenario table
        document.getElementById(scenario.id + 'Value').textContent = '€' + formatNumber(portfolioValue);
        document.getElementById(scenario.id + 'Gains').textContent = '€' + formatNumber(totalGains);
        document.getElementById(scenario.id + 'Dividends').textContent = '€' + formatNumber(annualDividends);
    });
}

// Monthly Investment Tracker Functions
function addMonthlyEntry() {
    const monthlyAmount = parseFloat(document.getElementById('monthlyAmount').value);
    const stockPercent = parseFloat(document.getElementById('stockPercent').value) / 100;
    const bondPercent = parseFloat(document.getElementById('bondPercent').value) / 100;

    const now = new Date();
    const monthName = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });

    const entry = {
        month: monthName,
        invested: monthlyAmount,
        vwce: Math.round(monthlyAmount * stockPercent),
        vgea: Math.round(monthlyAmount * bondPercent),
        portfolioValue: 0, // This would be updated manually
        status: 'Planned'
    };

    monthlyData.push(entry);
    updateMonthlyTable();
}

function updateMonthlyTable() {
    const tbody = document.querySelector('#monthlyTable tbody');
    tbody.innerHTML = '';

    monthlyData.forEach((entry, index) => {
        const row = document.createElement('tr');
        const statusColor = entry.status === 'Completed' ? '#28a745' : '#ffc107';

        row.innerHTML = `
            <td>${entry.month}</td>
            <td>€${entry.invested}</td>
            <td>€${entry.vwce}</td>
            <td>€${entry.vgea}</td>
            <td>€${entry.portfolioValue}</td>
            <td><span style="color: ${statusColor}; font-weight: 600;">${entry.status}</span></td>
            <td>
                <button class="btn" onclick="toggleStatus(${index})" 
                        style="padding: 5px 10px; font-size: 0.8rem;">
                    ${entry.status === 'Planned' ? '✓ Mark Complete' : '↻ Mark Planned'}
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function toggleStatus(index) {
    monthlyData[index].status = monthlyData[index].status === 'Planned' ? 'Completed' : 'Planned';
    updateMonthlyTable();
}

// Utility Functions
function formatNumber(num) {
    return Math.round(num).toLocaleString();
}

// Initialize Application
function initializeApp() {
    // Set up default projections
    updateProjections();

    // Add sample monthly entry for demonstration
    addMonthlyEntry();

    // Add event listeners for real-time updates
    const inputs = ['monthlyAmount', 'stockPercent', 'bondPercent', 'stockReturn', 'bondReturn'];
    inputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        element.addEventListener('input', updateProjections);
    });
}

// Portfolio Rebalancing Functions
function updatePortfolioBreakdown() {
    // This would be connected to real portfolio data
    // For now, it's a placeholder for future functionality
    const currentStockValue = 0;
    const currentBondValue = 0;
    const totalValue = currentStockValue + currentBondValue;

    if (totalValue > 0) {
        const currentStockPercent = (currentStockValue / totalValue) * 100;
        const currentBondPercent = (currentBondValue / totalValue) * 100;

        document.getElementById('currentStockValue').textContent = '€' + formatNumber(currentStockValue);
        document.getElementById('currentBondValue').textContent = '€' + formatNumber(currentBondValue);
        document.getElementById('currentStockPercent').textContent = Math.round(currentStockPercent) + '%';
        document.getElementById('currentBondPercent').textContent = Math.round(currentBondPercent) + '%';
    }
}

// Validation Functions
function validateAllocation() {
    const stockPercent = parseFloat(document.getElementById('stockPercent').value);
    const bondPercent = parseFloat(document.getElementById('bondPercent').value);

    if (stockPercent + bondPercent !== 100) {
        alert('Warning: Stock and Bond allocations should add up to 100%');
    }
}

// Run initialization when page loads
document.addEventListener('DOMContentLoaded', initializeApp);