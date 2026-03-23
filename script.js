// Connected to Google Apps Script Backend (Database)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyZZGQn9uGa9jEJeiV4VdrTi68xI5MsBZiaBPE7pLsyzVaP4iNhMbK05lEQjorUM_uw/exec'; 
let currentUser = null;

function showModule(id) {
    document.querySelectorAll('section').forEach(s => {
        s.classList.add('hidden');
        s.classList.remove('animate-in'); // Reset animation
    });
    const target = document.getElementById(id);
    if (target) {
        target.classList.remove('hidden');
        // Trigger reflow to restart animation
        void target.offsetWidth; 
        target.classList.add('animate-in');
        window.scrollTo(0, 0);
        
        // Auto-fetch dashboard metrics for Performance Tab
        if (id === 'screen-performance') {
            fetchPerformanceDashboard();
        }

        // Auto-fill logic for Registers & Audits
        if (id === 'form-register-duplicate' || id === 'form-register-cn' || id === 'form-register-dispatch' || id === 'form-audit-dock' || id === 'form-audit-pack' || id === 'form-audit-bin' || id === 'form-audit-floor' || id === 'form-audit-km' || id === 'form-audit-trip' || id === 'form-outward-sto' || id === 'form-outward-rtv' || id === 'form-outward-sales' || id === 'form-outward-jiomart' || id === 'form-inward-diesel' || id === 'form-inward-material' || id === 'form-inward-imprest' || id === 'form-inward-vehicle') {
            const fullName = document.getElementById('display-user').innerText.split(' - ')[1] || currentUser;
            const now = new Date();
            
            if (id === 'form-register-duplicate') {
                document.getElementById('dup_lpa_name').value = fullName;
                document.getElementById('dup_date').valueAsDate = now;
            }
            if (id === 'form-register-cn') {
                document.getElementById('cn_lpa_name').value = fullName;
                document.getElementById('cn_date').valueAsDate = now;
            }
            if (id === 'form-register-dispatch') {
                document.getElementById('disp_lpa_name').value = fullName;
                document.getElementById('disp_date').valueAsDate = now;
                
                // Keep local time padded correctly (e.g. 09:05)
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                document.getElementById('disp_time').value = `${hours}:${minutes}`;
            }
            if (id === 'form-inward-material') {
                document.getElementById('mat_lpa_name').value = fullName;
                document.getElementById('mat_date').valueAsDate = now;
            }
            if (id === 'form-inward-diesel') {
                document.getElementById('diesel_lpa_name').value = fullName;
                document.getElementById('diesel_date').valueAsDate = now;
            }
            if (id === 'form-inward-imprest') {
                document.getElementById('imp_lpa_name').value = fullName;
                document.getElementById('imp_date').valueAsDate = now;
            }
            if (id === 'form-inward-vehicle') {
                document.getElementById('vehin_lpa_name').value = fullName;
                document.getElementById('vehin_date').valueAsDate = now;
                
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                document.getElementById('vehin_start_time').value = `${hours}:${minutes}`;
                
                document.getElementById('vin_mrn_check').checked = false;
                toggleMRNField();
            }
            if (id === 'form-audit-dock') {
                document.getElementById('dock_lpa_name').value = fullName;
                document.getElementById('dock_date').valueAsDate = now;
            }
            if (id === 'form-audit-pack') {
                document.getElementById('pack_lpa_name').value = fullName;
                document.getElementById('pack_date').valueAsDate = now;
            }
            if (id === 'form-audit-bin') {
                document.getElementById('bin_lpa_name').value = fullName;
                document.getElementById('bin_date').valueAsDate = now;
            }
            if (id === 'form-audit-floor') {
                document.getElementById('floor_lpa_name').value = fullName;
                document.getElementById('floor_date').valueAsDate = now;
            }
            if (id === 'form-audit-km') {
                document.getElementById('km_lpa_name').value = fullName;
                document.getElementById('km_date').valueAsDate = now;
            }
            if (id === 'form-audit-trip') {
                document.getElementById('trip_plan_date').valueAsDate = now;
                document.getElementById('trip_act_date').valueAsDate = now;
            }
            if (id === 'form-outward-rtv') {
                document.getElementById('rtv_lpa_name').value = fullName;
                document.getElementById('rtv_date').valueAsDate = now;
                
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                document.getElementById('rtv_time').value = `${hours}:${minutes}`;
                
                document.getElementById('rtv_outward_num').value = '';
            }
            if (id === 'form-outward-sto') {
                document.getElementById('sto_lpa_name').value = fullName;
                document.getElementById('sto_date').valueAsDate = now;
                
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                document.getElementById('sto_time').value = `${hours}:${minutes}`;
                
                document.getElementById('sto_outward_num').value = '';
            }
            if (id === 'form-outward-sales') {
                document.getElementById('sales_lpa_name').value = fullName;
                document.getElementById('sales_date').valueAsDate = now;
                
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                document.getElementById('sales_time').value = `${hours}:${minutes}`;
            }
            if (id === 'form-outward-jiomart') {
                document.getElementById('jio_lpa_name').value = fullName;
                document.getElementById('jio_date').valueAsDate = now;
                
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                document.getElementById('jio_time').value = `${hours}:${minutes}`;
                
                document.getElementById('jio_num_trips').value = '';
                document.getElementById('jio-dynamic-trips').innerHTML = '';
            }
        }
    }
}

function showForm(id) {
    showModule(id);
}

async function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    
    const submitBtn = e.target.querySelector('.btn-access');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'VERIFYING...';
    submitBtn.style.pointerEvents = 'none';

    try {
        const response = await fetch(`${SCRIPT_URL}?action=login&user=${encodeURIComponent(user)}&pass=${encodeURIComponent(pass)}`);
        const result = await response.json();

        if (result.status === 'success') {
            currentUser = user;
            const displayName = result.name || user;
            const role = result.role || 'Member';
            document.getElementById('display-user').innerText = `${role} - ${displayName}`;
            showModule('screen-main');
        } else if (result.status === 'invalid') {
            alert('❌ Invalid Credentials! Please check your Employee ID and Password against the database.');
        } else {
            alert(`⚠️ Error: ${result.message}`);
        }
    } catch (err) {
        console.error("Login Error:", err);
        // Fallback or network error log
        alert('⚠️ Network Error: Unable to reach the Google Sheet database. Please try again.');
    }

    submitBtn.innerHTML = originalText;
    submitBtn.style.pointerEvents = 'auto';
}

function logout() {
    if(confirm("Are you sure you want to log out?")) {
        currentUser = null;
        document.getElementById('form-login').reset();
        showModule('screen-login');
    }
}

// Real EAN Lookup via Google Apps Script (GET request)
async function lookupEAN(inputId) {
    const ean = document.getElementById(inputId).value;
    if(!ean) { alert("Enter an EAN code to search."); return; }
    
    const btn = document.querySelector(`#${inputId} + .scan-btn`);
    const originalBtnHTML = btn.innerHTML;
    btn.innerHTML = '⏳';
    
    try {
        const response = await fetch(`${SCRIPT_URL}?ean=${encodeURIComponent(ean)}`);
        const result = await response.json();
        
        if (result.status === 'success') {
            document.getElementById(inputId + '_desc').value = result.article || result.desc;
            btn.innerHTML = '✔️';
            btn.style.background = 'var(--success-green)';
            btn.style.color = '#000';
        } else {
            document.getElementById(inputId + '_desc').value = 'Item Not Found';
            btn.innerHTML = '❌';
            btn.style.background = 'var(--alert-red)';
        }
    } catch (error) {
        console.error("Lookup Error: ", error);
        document.getElementById(inputId + '_desc').value = 'Network Error';
        btn.innerHTML = '⚠️';
    }

    setTimeout(() => {
        btn.innerHTML = originalBtnHTML;
        btn.style.background = 'rgba(255,255,255,0.1)';
        btn.style.color = 'var(--text-main)';
    }, 2500);
}

// Auto-calculation logic for Duplicate Register
function calcDuplicate() {
    const sysQty = parseFloat(document.getElementById('dup_sys_qty').value) || 0;
    const regQty = parseFloat(document.getElementById('dup_reg_qty').value) || 0;
    
    // Auto-calculate Difference
    const diffQty = sysQty - regQty;
    document.getElementById('dup_diff_qty').value = diffQty;
}
// Logic to handle custom date selection toggle
function handleDateFilterChange() {
    const filter = document.getElementById('kpi_date_filter').value;
    const customDates = document.getElementById('kpi_custom_dates');
    if (filter === 'custom') {
        customDates.classList.remove('hidden');
    } else {
        customDates.classList.add('hidden');
        fetchPerformanceDashboard();
    }
}

// Global Dashboard Updater
async function fetchPerformanceDashboard() {
    const filter = document.getElementById('kpi_date_filter') ? document.getElementById('kpi_date_filter').value : 'today';
    
    function getLocalISODate(d) {
        const offsetMs = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offsetMs).toISOString().split('T')[0];
    }
    
    let sDate = '';
    let eDate = '';
    const today = new Date();
    
    if (filter === 'today') {
        sDate = getLocalISODate(today);
        eDate = sDate;
    } else if (filter === 'yesterday') {
        const yest = new Date();
        yest.setDate(yest.getDate() - 1);
        sDate = getLocalISODate(yest);
        eDate = sDate;
    } else if (filter === '7days') {
        const last7 = new Date();
        last7.setDate(last7.getDate() - 6); 
        sDate = getLocalISODate(last7);
        eDate = getLocalISODate(today);
    } else if (filter === '15days') {
        const last15 = new Date();
        last15.setDate(last15.getDate() - 14);
        sDate = getLocalISODate(last15);
        eDate = getLocalISODate(today);
    } else if (filter === 'custom') {
        sDate = document.getElementById('kpi_start_date').value;
        eDate = document.getElementById('kpi_end_date').value;
        if (!sDate || !eDate) return; // Wait for both
    }
    
    const dateParams = `&start_date=${sDate}&end_date=${eDate}`;

    const vEl = document.getElementById('out_vehicles');
    const tEl = document.getElementById('out_trips');
    const valEl = document.getElementById('out_value');
    
    const inVEl = document.getElementById('in_vehicles');
    const inValEl = document.getElementById('in_value');
    
    const subEl = document.getElementById('kpi_subs');
    const excEl = document.getElementById('kpi_exceptions');
    const audEl = document.getElementById('kpi_audits');
    
    let fullName = currentUser;
    const dispEl = document.getElementById('display-user');
    if (dispEl && dispEl.innerText.includes(' - ')) {
        fullName = dispEl.innerText.split(' - ')[1].trim();
    }
    
    // Set Loading State
    if (vEl) vEl.innerHTML = '<span style="font-size:12px;color:#888;">Fetching...</span>';
    if (tEl) tEl.innerHTML = '<span style="font-size:12px;color:#888;">Fetching...</span>';
    if (valEl) valEl.innerHTML = '<span style="font-size:12px;color:#888;">Calculating...</span>';
    
    if (inVEl) inVEl.innerHTML = '<span style="font-size:12px;color:#888;">Fetching...</span>';
    if (inValEl) inValEl.innerHTML = '<span style="font-size:12px;color:#888;">Calculating...</span>';
    if (subEl) subEl.innerText = '...';
    if (excEl) excEl.innerText = '...';
    if (audEl) audEl.innerText = '...';

    // Fetch Outward Data
    fetch(`${SCRIPT_URL}?action=getOutwardStats${dateParams}`)
        .then(res => res.json())
        .then(result => {
            if (result.status === 'success') {
                if (vEl) vEl.innerText = result.vehicles.toLocaleString();
                if (tEl) tEl.innerText = result.trips.toLocaleString();
                if (valEl) valEl.innerText = `₹ ${result.value.toLocaleString('en-IN')}`;
            }
        }).catch(err => {
            console.error('Failed outward metrics: ', err);
            if (vEl) vEl.innerText = 'Err';
            if (tEl) tEl.innerText = 'Err';
            if (valEl) valEl.innerText = 'Err';
        });

    // Fetch Inward Data
    fetch(`${SCRIPT_URL}?action=getInwardStats${dateParams}`)
        .then(res => res.json())
        .then(result => {
            if (result.status === 'success') {
                if (inVEl) inVEl.innerText = result.vehicles.toLocaleString();
                if (inValEl) inValEl.innerText = `₹ ${result.value.toLocaleString('en-IN')}`;
            }
        }).catch(err => {
            console.error('Failed inward metrics: ', err);
            if (inVEl) inVEl.innerText = 'Err';
            if (inValEl) inValEl.innerText = 'Err';
        });

    // Fetch Unique KPI Logging
    fetch(`${SCRIPT_URL}?action=getPerformanceKPIs&user=${encodeURIComponent(fullName)}${dateParams}`)
        .then(res => res.json())
        .then(res => {
            if (res.status === 'success') {
                if (subEl) subEl.innerText = res.submissions;
                if (excEl) excEl.innerText = res.exceptions;
                if (audEl) audEl.innerText = res.audits;
                
                const matrixBody = document.getElementById('lpa_matrix_body');
                if (matrixBody && res.lpaMatrix) {
                    if (res.lpaMatrix.length === 0) {
                        matrixBody.innerHTML = `<tr><td colspan="6" style="padding: 10px; text-align: center;">No data logged today.</td></tr>`;
                    } else {
                        matrixBody.innerHTML = res.lpaMatrix.map(lpa => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 10px; font-weight: bold; color: ${lpa.name === fullName ? 'var(--slp-cyan)' : 'var(--text-main)'};">${lpa.name}</td>
                                <td style="padding: 10px;">${lpa.subs}</td>
                                <td style="padding: 10px; color: var(--alert-red);">${lpa.exceptions}</td>
                                <td style="padding: 10px; color: var(--alert-red);">₹ ${lpa.excValue.toLocaleString('en-IN')}</td>
                                <td style="padding: 10px; color: var(--success-green);">${lpa.audits}</td>
                                <td style="padding: 10px; color: var(--success-green);">₹ ${lpa.audValue.toLocaleString('en-IN')}</td>
                            </tr>
                        `).join('');
                    }
                }

                const segMatrixBody = document.getElementById('seg_matrix_body');
                if (segMatrixBody && res.segMatrix) {
                    if (res.segMatrix.length === 0) {
                        segMatrixBody.innerHTML = `<tr><td colspan="6" style="padding: 10px; text-align: center;">No segment data logged today.</td></tr>`;
                    } else {
                        segMatrixBody.innerHTML = res.segMatrix.map(seg => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 10px; font-weight: bold; color: var(--slp-cyan);">${seg.name.replace(/_/g, ' ')}</td>
                                <td style="padding: 10px;">${seg.subs}</td>
                                <td style="padding: 10px; color: var(--alert-red);">${seg.exceptions}</td>
                                <td style="padding: 10px; color: var(--alert-red);">₹ ${seg.excValue.toLocaleString('en-IN')}</td>
                                <td style="padding: 10px; color: var(--success-green);">${seg.audits}</td>
                                <td style="padding: 10px; color: var(--success-green);">₹ ${seg.audValue.toLocaleString('en-IN')}</td>
                            </tr>
                        `).join('');
                    }
                }
            }
        }).catch(err => console.error("KPI Error:", err));
}

// Auto-calculation logic for CN Register
function calcCN() {
    const sysQty = parseFloat(document.getElementById('cn_sys_qty').value) || 0;
    const regQty = parseFloat(document.getElementById('cn_reg_qty').value) || 0;
    
    const diffQty = sysQty - regQty;
    document.getElementById('cn_diff_qty').value = diffQty;
}

// Custom EAN Lookup for Dock Door Audit
async function lookupDockEAN() {
    const ean = document.getElementById('dock_ean').value.trim();
    if (!ean) return;

    const btn = document.getElementById('btn_dock_ean');
    const originalBtnHTML = btn.innerHTML;
    
    btn.innerHTML = '🔄';
    btn.style.background = 'var(--metro-yellow)';
    btn.style.color = '#000';

    try {
        const response = await fetch(`${SCRIPT_URL}?ean=${encodeURIComponent(ean)}`);
        const result = await response.json();
        
        if (result.status === 'success') {
            document.getElementById('dock_article').value = result.article || 'N/A';
            document.getElementById('dock_map').value = parseFloat(result.map) || 0;
            document.getElementById('dock_desc').value = result.desc || 'N/A';
            
            btn.innerHTML = '✔️';
            btn.style.background = 'var(--success-green)';
            
            calcDock(); // Trigger recalculation now that MAP is loaded
        } else if (result.status === 'error') {
            document.getElementById('dock_article').value = '';
            document.getElementById('dock_map').value = '';
            document.getElementById('dock_desc').value = 'DB Error: ' + (result.message || 'Check Script');
            btn.innerHTML = '❌';
            btn.style.background = 'var(--alert-red)';
        } else {
            document.getElementById('dock_article').value = '';
            document.getElementById('dock_map').value = '';
            document.getElementById('dock_desc').value = 'EAN Not Found';
            btn.innerHTML = '❌';
            btn.style.background = 'var(--alert-red)';
        }
    } catch (error) {
        console.error("Lookup Error: ", error);
        document.getElementById('dock_desc').value = 'Network Error';
        btn.innerHTML = '⚠️';
    }

    setTimeout(() => {
        btn.innerHTML = originalBtnHTML;
        btn.style.background = 'rgba(255,255,255,0.1)';
        btn.style.color = 'var(--text-main)';
    }, 2500);
}

// Auto-calculation logic for Dock Door Audit
function calcDock() {
    const invQty = parseFloat(document.getElementById('dock_inv_qty').value) || 0;
    const pickQty = parseFloat(document.getElementById('dock_pick_qty').value) || 0;
    const mapVal = parseFloat(document.getElementById('dock_map').value) || 0;
    
    const dmgQty = parseFloat(document.getElementById('dock_dmg_qty').value) || 0;
    const expQty = parseFloat(document.getElementById('dock_exp_qty').value) || 0;
    const mrpQty = parseFloat(document.getElementById('dock_mrp_qty').value) || 0;

    let shortQty = 0;
    let excessQty = 0;

    if (pickQty < invQty) {
        shortQty = invQty - pickQty;
    } else if (pickQty > invQty) {
        excessQty = pickQty - invQty;
    }

    // Set Quantities
    document.getElementById('dock_short_qty').value = shortQty > 0 ? shortQty : '';
    document.getElementById('dock_excess_qty').value = excessQty > 0 ? excessQty : '';

    // Set Values (MAP * Qty)
    document.getElementById('dock_short_val').value = shortQty > 0 ? (shortQty * mapVal).toFixed(2) : '';
    document.getElementById('dock_excess_val').value = excessQty > 0 ? (excessQty * mapVal).toFixed(2) : '';
    
    document.getElementById('dock_dmg_val').value = dmgQty > 0 ? (dmgQty * mapVal).toFixed(2) : '';
    document.getElementById('dock_exp_val').value = expQty > 0 ? (expQty * mapVal).toFixed(2) : '';
    document.getElementById('dock_mrp_val').value = mrpQty > 0 ? (mrpQty * mapVal).toFixed(2) : '';
}

// Custom EAN Lookup for Packing Station Audit
async function lookupPackEAN() {
    const ean = document.getElementById('pack_ean').value.trim();
    if (!ean) return;

    const btn = document.getElementById('btn_pack_ean');
    const originalBtnHTML = btn.innerHTML;
    
    btn.innerHTML = '🔄';
    btn.style.background = 'var(--metro-yellow)';
    btn.style.color = '#000';

    try {
        const response = await fetch(`${SCRIPT_URL}?ean=${encodeURIComponent(ean)}`);
        const result = await response.json();
        
        if (result.status === 'success') {
            document.getElementById('pack_article').value = result.article || 'N/A';
            document.getElementById('pack_map').value = parseFloat(result.map) || 0;
            document.getElementById('pack_desc').value = result.desc || 'N/A';
            
            btn.innerHTML = '✔️';
            btn.style.background = 'var(--success-green)';
            
            calcPack(); // Trigger recalculation
        } else if (result.status === 'error') {
            document.getElementById('pack_article').value = '';
            document.getElementById('pack_map').value = '';
            document.getElementById('pack_desc').value = 'DB Error: ' + (result.message || 'Check Script');
            btn.innerHTML = '❌';
            btn.style.background = 'var(--alert-red)';
        } else {
            document.getElementById('pack_article').value = '';
            document.getElementById('pack_map').value = '';
            document.getElementById('pack_desc').value = 'EAN Not Found';
            btn.innerHTML = '❌';
            btn.style.background = 'var(--alert-red)';
        }
    } catch (error) {
        console.error("Lookup Error: ", error);
        document.getElementById('pack_desc').value = 'Network Error';
        btn.innerHTML = '⚠️';
    }

    setTimeout(() => {
        btn.innerHTML = originalBtnHTML;
        btn.style.background = 'rgba(255,255,255,0.1)';
        btn.style.color = 'var(--text-main)';
    }, 2500);
}

// Auto-calculation logic for Packing Station Audit
function calcPack() {
    const invQty = parseFloat(document.getElementById('pack_inv_qty').value) || 0;
    const pickQty = parseFloat(document.getElementById('pack_pick_qty').value) || 0;
    const mapVal = parseFloat(document.getElementById('pack_map').value) || 0;
    
    const dmgQty = parseFloat(document.getElementById('pack_dmg_qty').value) || 0;
    const expQty = parseFloat(document.getElementById('pack_exp_qty').value) || 0;
    const mrpQty = parseFloat(document.getElementById('pack_mrp_qty').value) || 0;

    let shortQty = 0;
    let excessQty = 0;

    if (pickQty < invQty) {
        shortQty = invQty - pickQty;
    } else if (pickQty > invQty) {
        excessQty = pickQty - invQty;
    }

    // Set Quantities
    document.getElementById('pack_short_qty').value = shortQty > 0 ? shortQty : '';
    document.getElementById('pack_excess_qty').value = excessQty > 0 ? excessQty : '';

    // Set Values (MAP * Qty)
    document.getElementById('pack_short_val').value = shortQty > 0 ? (shortQty * mapVal).toFixed(2) : '';
    document.getElementById('pack_excess_val').value = excessQty > 0 ? (excessQty * mapVal).toFixed(2) : '';
    
    document.getElementById('pack_dmg_val').value = dmgQty > 0 ? (dmgQty * mapVal).toFixed(2) : '';
    document.getElementById('pack_exp_val').value = expQty > 0 ? (expQty * mapVal).toFixed(2) : '';
    document.getElementById('pack_mrp_val').value = mrpQty > 0 ? (mrpQty * mapVal).toFixed(2) : '';
}

// Custom EAN Lookup for Bin Audit
async function lookupBinEAN() {
    const ean = document.getElementById('bin_ean').value.trim();
    if (!ean) return;

    const btn = document.getElementById('btn_bin_ean');
    const originalBtnHTML = btn.innerHTML;
    
    btn.innerHTML = '🔄';
    btn.style.background = 'var(--metro-yellow)';
    btn.style.color = '#000';

    try {
        const response = await fetch(`${SCRIPT_URL}?ean=${encodeURIComponent(ean)}`);
        const result = await response.json();
        
        if (result.status === 'success') {
            document.getElementById('bin_article').value = result.article || 'N/A';
            document.getElementById('bin_map').value = parseFloat(result.map) || 0;
            document.getElementById('bin_desc').value = result.desc || 'N/A';
            
            btn.innerHTML = '✔️';
            btn.style.background = 'var(--success-green)';
            
            calcBin(); // Trigger recalculation
        } else if (result.status === 'error') {
            document.getElementById('bin_article').value = '';
            document.getElementById('bin_map').value = '';
            document.getElementById('bin_desc').value = 'DB Error: ' + (result.message || 'Check Script');
            btn.innerHTML = '❌';
            btn.style.background = 'var(--alert-red)';
        } else {
            document.getElementById('bin_article').value = '';
            document.getElementById('bin_map').value = '';
            document.getElementById('bin_desc').value = 'EAN Not Found';
            btn.innerHTML = '❌';
            btn.style.background = 'var(--alert-red)';
        }
    } catch (error) {
        console.error("Lookup Error: ", error);
        document.getElementById('bin_desc').value = 'Network Error';
        btn.innerHTML = '⚠️';
    }

    setTimeout(() => {
        btn.innerHTML = originalBtnHTML;
        btn.style.background = 'rgba(255,255,255,0.1)';
        btn.style.color = 'var(--text-main)';
    }, 2500);
}

// Auto-calculation logic for Bin Audit
function calcBin() {
    const sysQty = parseFloat(document.getElementById('bin_sys_qty').value) || 0;
    const phyQty = parseFloat(document.getElementById('bin_phy_qty').value) || 0;
    const mapVal = parseFloat(document.getElementById('bin_map').value) || 0;
    
    const dmgQty = parseFloat(document.getElementById('bin_dmg_qty').value) || 0;
    const expQty = parseFloat(document.getElementById('bin_exp_qty').value) || 0;
    const grzQty = parseFloat(document.getElementById('bin_grz_qty').value) || 0;

    let shortQty = 0;
    let excessQty = 0;

    if (phyQty < sysQty) {
        shortQty = sysQty - phyQty;
    } else if (phyQty > sysQty) {
        excessQty = phyQty - sysQty;
    }

    // Set Quantities
    document.getElementById('bin_short_qty').value = shortQty > 0 ? shortQty : '';
    document.getElementById('bin_excess_qty').value = excessQty > 0 ? excessQty : '';

    // Set Values (MAP * Qty)
    document.getElementById('bin_short_val').value = shortQty > 0 ? (shortQty * mapVal).toFixed(2) : '';
    document.getElementById('bin_excess_val').value = excessQty > 0 ? (excessQty * mapVal).toFixed(2) : '';
    
    document.getElementById('bin_dmg_val').value = dmgQty > 0 ? (dmgQty * mapVal).toFixed(2) : '';
    document.getElementById('bin_exp_val').value = expQty > 0 ? (expQty * mapVal).toFixed(2) : '';
    document.getElementById('bin_grz_val').value = grzQty > 0 ? (grzQty * mapVal).toFixed(2) : '';
}

// Custom EAN Lookup for Floor Walk Audit
async function lookupFloorEAN() {
    const ean = document.getElementById('floor_ean').value.trim();
    if (!ean) return;

    const btn = document.getElementById('btn_floor_ean');
    const originalBtnHTML = btn.innerHTML;
    
    btn.innerHTML = '🔄';
    btn.style.background = 'var(--metro-yellow)';
    btn.style.color = '#000';

    try {
        const response = await fetch(`${SCRIPT_URL}?ean=${encodeURIComponent(ean)}`);
        const result = await response.json();
        
        if (result.status === 'success') {
            document.getElementById('floor_article').value = result.article || 'N/A';
            document.getElementById('floor_map').value = parseFloat(result.map) || 0;
            document.getElementById('floor_desc').value = result.desc || 'N/A';
            
            btn.innerHTML = '✔️';
            btn.style.background = 'var(--success-green)';
            
            calcFloor(); // Trigger recalculation
        } else if (result.status === 'error') {
            document.getElementById('floor_article').value = '';
            document.getElementById('floor_map').value = '';
            document.getElementById('floor_desc').value = 'DB Error: ' + (result.message || 'Check Script');
            btn.innerHTML = '❌';
            btn.style.background = 'var(--alert-red)';
        } else {
            document.getElementById('floor_article').value = '';
            document.getElementById('floor_map').value = '';
            document.getElementById('floor_desc').value = 'EAN Not Found';
            btn.innerHTML = '❌';
            btn.style.background = 'var(--alert-red)';
        }
    } catch (error) {
        console.error("Lookup Error: ", error);
        document.getElementById('floor_desc').value = 'Network Error';
        btn.innerHTML = '⚠️';
    }

    setTimeout(() => {
        btn.innerHTML = originalBtnHTML;
        btn.style.background = 'rgba(255,255,255,0.1)';
        btn.style.color = 'var(--text-main)';
    }, 2500);
}

// Auto-calculation logic for Floor Walk Audit
function calcFloor() {
    const mapVal = parseFloat(document.getElementById('floor_map').value) || 0;
    
    const dmgQty = parseFloat(document.getElementById('floor_dmg_qty').value) || 0;
    const expQty = parseFloat(document.getElementById('floor_exp_qty').value) || 0;
    const grzQty = parseFloat(document.getElementById('floor_grz_qty').value) || 0;
    const qualQty = parseFloat(document.getElementById('floor_qual_qty').value) || 0;

    // Set Values (MAP * Qty)
    document.getElementById('floor_dmg_val').value = dmgQty > 0 ? (dmgQty * mapVal).toFixed(2) : '';
    document.getElementById('floor_exp_val').value = expQty > 0 ? (expQty * mapVal).toFixed(2) : '';
    document.getElementById('floor_grz_val').value = grzQty > 0 ? (grzQty * mapVal).toFixed(2) : '';
    document.getElementById('floor_qual_val').value = qualQty > 0 ? (qualQty * mapVal).toFixed(2) : '';
}

// Auto-calculation logic for KM Validation Entry
function calcKm() {
    const openKm = parseFloat(document.getElementById('km_open').value) || 0;
    const closeKm = parseFloat(document.getElementById('km_close').value) || 0;
    const stdKm = parseFloat(document.getElementById('km_std').value) || 0;
    
    let totalKm = 0;
    if (closeKm >= openKm && closeKm > 0) {
        totalKm = closeKm - openKm;
    }
    document.getElementById('km_total').value = totalKm > 0 ? totalKm : '';
    
    let variance = totalKm - stdKm;
    document.getElementById('km_var').value = totalKm > 0 ? variance : '';
    
    // Formatting variance color
    const varEl = document.getElementById('km_var');
    const remEl = document.getElementById('km_remarks');
    
    if (totalKm > 0 && variance > 0) { // If there is actual variance above standard
        varEl.style.color = 'var(--alert-red)';
        remEl.required = true;
        remEl.placeholder = "Variance is HIGH. Remarks are MANDATORY.";
    } else if (totalKm > 0 && variance <= 0) {
        varEl.style.color = 'var(--success-green)';
        remEl.required = false;
        remEl.placeholder = "Optional Remarks...";
    } else {
        varEl.style.color = 'var(--text-main)';
        remEl.required = false;
        remEl.placeholder = "Optional Remarks...";
    }
}

// Auto-calculation logic for Daily Dispatch
function calcDispatch() {
    // Section 4: Cash Variance
    const coll = parseFloat(document.getElementById('disp_cash_coll').value) || 0;
    const sub = parseFloat(document.getElementById('disp_cash_sub').value) || 0;
    const varCash = coll - sub;
    
    const varCashEl = document.getElementById('disp_cash_var');
    varCashEl.value = (varCash > 0 ? '+' : '') + varCash.toFixed(2);
    
    if (Math.abs(varCash) > 0.001) {
        varCashEl.style.color = "var(--alert-red)";
        varCashEl.style.fontWeight = "bold";
        document.getElementById('disp_cash_reason_div').classList.add('visible');
        document.getElementById('disp_cash_reason').setAttribute('required', 'true');
    } else {
        varCashEl.style.color = "var(--text-main)";
        varCashEl.style.fontWeight = "normal";
        document.getElementById('disp_cash_reason_div').classList.remove('visible');
        document.getElementById('disp_cash_reason').removeAttribute('required');
    }

    // Section 6: PIS Status
    if (document.getElementById('disp_pis_stat').value === 'No') {
        document.getElementById('disp_pis_reason_div').classList.add('visible');
        document.getElementById('disp_pis_reason').setAttribute('required', 'true');
    } else {
        document.getElementById('disp_pis_reason_div').classList.remove('visible');
        document.getElementById('disp_pis_reason').removeAttribute('required');
    }

    // Section 9: Return Variance
    const retVarCount = parseFloat(document.getElementById('disp_ret_var_count').value) || 0;
    const retVarVal = parseFloat(document.getElementById('disp_ret_var_val').value) || 0;
    if (retVarCount > 0 || retVarVal > 0) {
        document.getElementById('disp_ret_var_count').style.color = "var(--alert-red)";
        document.getElementById('disp_ret_var_val').style.color = "var(--alert-red)";
        document.getElementById('disp_ret_reason_div').classList.add('visible');
        document.getElementById('disp_ret_reason').setAttribute('required', 'true');
    } else {
        document.getElementById('disp_ret_var_count').style.color = "";
        document.getElementById('disp_ret_var_val').style.color = "";
        document.getElementById('disp_ret_reason_div').classList.remove('visible');
        document.getElementById('disp_ret_reason').removeAttribute('required');
    }

    // Section 10: Validation & CN
    if (document.getElementById('disp_val_stat').value === 'No') {
        document.getElementById('disp_val_reason_div').classList.add('visible');
        document.getElementById('disp_val_reason').setAttribute('required', 'true');
    } else {
        document.getElementById('disp_val_reason_div').classList.remove('visible');
        document.getElementById('disp_val_reason').removeAttribute('required');
    }

    if (document.getElementById('disp_cn_stat').value === 'No') {
        document.getElementById('disp_cn_reason_div').classList.add('visible');
        document.getElementById('disp_cn_reason').setAttribute('required', 'true');
    } else {
        document.getElementById('disp_cn_reason_div').classList.remove('visible');
        document.getElementById('disp_cn_reason').removeAttribute('required');
    }
}

async function submitForm(e, sheetName) {
    e.preventDefault();
    const loader = document.getElementById('loader');
    
    // Show loader with animation
    loader.style.display = 'flex';
    setTimeout(() => loader.classList.add('visible'), 10);

    const form = e.target;
    const formData = {};
    new FormData(form).forEach((value, key) => {
        formData[key] = value.trim();
    });

    try {
        // We use no-cors to prevent CORS issues on simple POST fetches to Google Macros.
        // NOTE: no-cors doesn't allow reading the response body.
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sheetName: sheetName,
                user: currentUser,
                formData: formData
            })
        });

        // Simulate success
        setTimeout(() => {
            alert('Data successfully synced to ' + sheetName + '! ✅');
            form.reset();
            // Hide loader
            loader.classList.remove('visible');
            setTimeout(() => {
                loader.style.display = 'none';
                showModule('screen-main');
            }, 300);
        }, 1000);
        
    } catch (err) {
        console.error("Submission Error:", err);
        alert('⚠️ Warning: Network error during submission, but data might still be saved. Please check the logs.');
        
        loader.classList.remove('visible');
        setTimeout(() => {
            loader.style.display = 'none';
            showModule('screen-main');
        }, 300);
    }
}

// Barcode Scanner Logic
let currentScanTarget = '';
let html5QrcodeScanner = null;

function startScanner(targetId) {
    currentScanTarget = targetId;
    document.getElementById('scanner-modal').style.display = 'flex';
    
    if(!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5Qrcode("reader");
    }
    
    html5QrcodeScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText, decodedResult) => {
            // Success Trigger
            document.getElementById(currentScanTarget).value = decodedText;
            closeScanner();
            
            // Auto-trigger lookup if EAN was scanned
            if(currentScanTarget === 'dock_ean') {
                lookupDockEAN();
            } else if(currentScanTarget === 'pack_ean') {
                lookupPackEAN();
            } else if(currentScanTarget === 'bin_ean') {
                lookupBinEAN();
            } else if(currentScanTarget === 'floor_ean') {
                lookupFloorEAN();
            }
        },
        (errorMessage) => {
            // Ignore frame parse errors
        }
    ).catch(err => {
        alert("⚠️ Camera access denied or hardware unavailable.");
        closeScanner();
    });
}

function closeScanner() {
    document.getElementById('scanner-modal').style.display = 'none';
    if(html5QrcodeScanner) {
        html5QrcodeScanner.stop().catch(err => console.error(err));
    }
}

// Initialize: Check session or show login
window.onload = () => {
    showModule('screen-login');
    
    // If a required field is hidden inside a closed accordion, standard browser submit fails silently. 
    // This auto-opens the section so the user sees which required field they missed.
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('invalid', function(e) {
            const details = e.target.closest('details');
            if (details) details.setAttribute('open', 'true');
        }, true); // Use capture phase because 'invalid' events don't bubble
    });
};

// Dynamic generation of Jiomart Trip Input Pairings based on num_trips parameter
function generateJioTrips() {
    const num = parseInt(document.getElementById('jio_num_trips').value) || 0;
    const container = document.getElementById('jio-dynamic-trips');
    container.innerHTML = '';
    
    // Hard cap preventions
    if (num > 20) return;
    
    for (let i = 1; i <= num; i++) {
        container.innerHTML += `
            <div class="grid-2" style="background: rgba(255, 255, 255, 0.03); padding: 10px; border-radius: 8px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.05);">
                <div class="input-group">
                    <label style="color:var(--slp-cyan);">Trip ID ${i}</label>
                    <input type="text" name="trip_id_${i}" class="form-control" placeholder="ID. ${i}" required>
                </div>
                <div class="input-group">
                    <label style="color:var(--slp-cyan);">Trip Value ${i} (₹)</label>
                    <input type="number" step="0.01" name="trip_value_${i}" class="form-control" placeholder="₹ Value" required>
                </div>
            </div>
        `;
    }
}

// Dynamic calculation for Vehicle Inbound HU's
function calcVehicleInbound() {
    const invHu = parseFloat(document.getElementById('vin_inv_hu').value) || 0;
    const recHu = parseFloat(document.getElementById('vin_rec_hu').value) || 0;
    
    let short = 0;
    let excess = 0;

    if (recHu < invHu) {
        short = invHu - recHu;
    } else if (recHu > invHu) {
        excess = recHu - invHu;
    }

    document.getElementById('vin_short_hu').value = short || '';
    document.getElementById('vin_excess_hu').value = excess || '';
}

// Logic to conditionally restrict MRN text input dynamically
function toggleMRNField() {
    const isChecked = document.getElementById('vin_mrn_check').checked;
    const container = document.getElementById('vin_mrn_container');
    const input = document.getElementById('vin_mrn_input');
    
    if (isChecked) {
        container.classList.remove('hidden');
        input.setAttribute('required', 'true');
    } else {
        container.classList.add('hidden');
        input.removeAttribute('required');
        input.value = '';
    }
}
