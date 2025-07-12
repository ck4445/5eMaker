// Allowed value lists for dropdowns
const SKILLS = ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"];
const SAVING_THROWS = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];
const LANGUAGES = ["All", "Abyssal", "Aquan", "Auran", "Celestial", "Common", "Deep Speech", "Draconic", "Dwarvish", "Elvish", "Giant", "Gnomish", "Goblin", "Halfling", "Ignan", "Infernal", "Orc", "Primordial", "Sylvan", "Terran", "Undercommon"];

// Global state
let currentStatblock = {};
let editing = false;

// --- UTILITY FUNCTIONS ---
function safeField(obj, k, d = "") { return obj && typeof obj[k] !== 'undefined' ? obj[k] : d; }
function safeList(obj, k) { return (obj && Array.isArray(obj[k])) ? obj[k] : []; }

function statModifier(val) {
    const intVal = parseInt(val);
    if (isNaN(intVal)) return "";
    const mod = Math.floor((intVal - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

// --- RENDERING LOGIC ---

function render() {
    const container = document.getElementById('statblock-container');
    const hasStatblock = Object.keys(currentStatblock).length > 0;

    if (hasStatblock) {
        container.innerHTML = renderStatblock(currentStatblock);
        document.getElementById('edit-controls').style.display = 'block';
    } else {
        container.innerHTML = ""; // Clear if no statblock
        document.getElementById('edit-controls').style.display = 'none';
    }

    // Update button states
    document.getElementById('edit-btn').disabled = editing;
    document.getElementById('save-btn').disabled = !editing;
    document.getElementById('download-aimon-btn').disabled = !hasStatblock;
    document.getElementById('download-png-btn').disabled = !hasStatblock;
}

function renderStatblock(stat) {
    const abilityScores = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    
    // Helper to render a simple key-value pair if the value exists
    const renderTrait = (label, value) => value ? `<div class="trait-line"><b>${label}</b> ${field(label.toLowerCase().replace(/ /g, '_'), value)}</div>` : '';
    
    // Helper to render lists like Skills and Saving Throws
    const renderKeyValueList = (list, key, allowed) => {
        if (!list || list.length === 0) return '';
        if (editing) {
            return list.map((item, idx) => `
                <div class="edit-list-item">
                    ${dropdown(key, idx, 'name', safeField(item, 'name'), allowed)}
                    <input type="text" value="${safeField(item, 'desc')}" onchange="editList('${key}', ${idx}, 'desc', this.value)" style="width: 80px;">
                    <button class="remove-btn" onclick="removeItem('${key}', ${idx})">X</button>
                </div>
            `).join('') + `<button class="add-btn" onclick="addItem('${key}')">+ Add</button>`;
        }
        return list.map(item => `<b>${safeField(item, 'name')}</b> ${safeField(item, 'desc')}`).join(', ');
    };
    
    // Helper for complex lists like Actions and Abilities
    const renderComplexList = (list, key) => {
        if (!list || list.length === 0) {
             return editing ? `<button class="add-btn" onclick="addItem('${key}')">+ Add</button>` : '';
        }
        const itemsHTML = list.map((item, idx) => {
            if (editing) {
                return `
                    <div class="edit-list-item">
                        <input type="text" value="${safeField(item, 'name')}" onchange="editList('${key}', ${idx}, 'name', this.value)" placeholder="Name" style="width: 30%;">
                        <textarea onchange="editList('${key}', ${idx}, 'desc', this.value)" placeholder="Description">${safeField(item, 'desc')}</textarea>
                        <button class="remove-btn" onclick="removeItem('${key}', ${idx})">X</button>
                    </div>`;
            }
            return `<p><b><em>${safeField(item, 'name')}.</em></b> ${safeField(item, 'desc')}</p>`;
        }).join('');
        
        return itemsHTML + (editing ? `<button class="add-btn" onclick="addItem('${key}')">+ Add</button>` : '');
    };

    return `
    <div class="statblock" id="statblock-view">
        <div class="tapered-rule"></div>
        <div class="monster-name">${field('name', safeField(stat, 'name'))}</div>
        <div class="monster-meta"><i>${field('size_type', safeField(stat, 'size_type'))}, ${field('alignment', safeField(stat, 'alignment'))}</i></div>
        <div class="tapered-rule"></div>
        
        <div class="trait-line"><b>Armor Class</b> ${field('armor_class', safeField(stat, 'armor_class'))}</div>
        <div class="trait-line"><b>Hit Points</b> ${field('hit_points', safeField(stat, 'hit_points'))}</div>
        <div class="trait-line"><b>Speed</b> ${field('speed', safeField(stat, 'speed'))}</div>
        
        <div class="tapered-rule"></div>
        <div class="ability-scores">
            ${abilityScores.map(score => abilityBlock(score, safeField(stat, score))).join('')}
        </div>
        <div class="tapered-rule"></div>

        ${renderTrait('Damage Vulnerabilities', safeField(stat, 'damage_vulnerabilities'))}
        ${renderTrait('Damage Resistances', safeField(stat, 'damage_resistances'))}
        ${renderTrait('Damage Immunities', safeField(stat, 'damage_immunities'))}
        ${renderTrait('Condition Immunities', safeField(stat, 'condition_immunities'))}
        <div class="trait-line"><b>Senses</b> ${field('senses', safeField(stat, 'senses'))}</div>
        <div class="trait-line"><b>Languages</b> ${field('languages', safeField(stat, 'languages'))}</div>
        <div class="trait-line"><b>Challenge</b> ${field('challenge', safeField(stat, 'challenge'))}</div>

        <div class="trait-line"><b>Saving Throws</b> ${renderKeyValueList(safeList(stat, 'saving_throws'), 'saving_throws', SAVING_THROWS)}</div>
        <div class="trait-line"><b>Skills</b> ${renderKeyValueList(safeList(stat, 'skills'), 'skills', SKILLS)}</div>

        <div class="tapered-rule"></div>

        <div class="abilities-section">
            ${renderComplexList(safeList(stat, 'abilities'), 'abilities')}
        </div>

        <h3 class="actions-header">Actions</h3>
        <div class="actions-section">
            ${renderComplexList(safeList(stat, 'actions'), 'actions')}
        </div>
        <div class="tapered-rule bottom"></div>
    </div>
    `;
}


// --- DYNAMIC HTML FOR EDITING ---

function field(name, value) {
    return editing ? `<input type="text" class="inline-edit" name="${name}" value="${value || ""}" onchange="editField('${name}', this.value)">` : `<span>${value || ""}</span>`;
}

function dropdown(key, idx, subkey, value, list) {
    return `<select onchange="editList('${key}', ${idx}, '${subkey}', this.value)">
        ${list.map(opt => `<option value="${opt}" ${opt === value ? "selected" : ""}>${opt}</option>`).join("")}
    </select>`;
}

function abilityBlock(name, value) {
    const mod = statModifier(value);
    return `
        <div class="ability-score">
            <h4>${name.substring(0, 3).toUpperCase()}</h4>
            ${editing ? 
                `<input type="number" min="1" max="30" value="${value}" onchange="editField('${name}', this.value)">` :
                `<p>${value} (${mod})</p>`
            }
        </div>`;
}


// --- EVENT HANDLERS & STATE MODIFICATION ---

window.editField = (fieldName, value) => {
    currentStatblock[fieldName] = value;
    if (['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].includes(fieldName)) {
        render(); // Re-render immediately to update modifier
    }
};

window.editList = (key, idx, subkey, value) => {
    if (currentStatblock[key] && currentStatblock[key][idx]) {
        currentStatblock[key][idx][subkey] = value;
    }
};

window.addItem = (key) => {
    if (!Array.isArray(currentStatblock[key])) {
        currentStatblock[key] = [];
    }
    currentStatblock[key].push({ name: 'New Item', desc: '' });
    render();
};

window.removeItem = (key, idx) => {
    if (currentStatblock[key] && currentStatblock[key][idx]) {
        currentStatblock[key].splice(idx, 1);
        render();
    }
};

function toggleEdit(isEditing) {
    editing = isEditing;
    if (!isEditing) {
        // A full re-render on save ensures all changes are displayed correctly
        render();
    }
    render();
}

// Attach listeners to main control buttons
document.getElementById('edit-btn').onclick = () => toggleEdit(true);
document.getElementById('save-btn').onclick = () => {
    toggleEdit(false);
    // Add a small visual feedback on save
    const btn = document.getElementById('save-btn');
    btn.textContent = 'Saved!';
    setTimeout(() => { btn.textContent = 'Save'; }, 1500);
};


window.downloadPNG = function() {
    const el = document.getElementById('statblock-view');
    if (!el || !window.html2canvas) return;
    
    // Temporarily remove box-shadow for cleaner capture
    el.style.boxShadow = 'none';

    html2canvas(el, { backgroundColor: null }).then(canvas => {
        const link = document.createElement('a');
        link.download = (safeField(currentStatblock, 'name', 'monster') || 'monster').replace(/ /g, '_') + "_statblock.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        // Restore box-shadow after capture
        el.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    });
};

document.getElementById("download-png-btn").onclick = downloadPNG;

document.getElementById("download-aimon-btn").onclick = function() {
    const data = JSON.stringify(currentStatblock, null, 2);
    const blob = new Blob([data], {type: "application/json"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = (safeField(currentStatblock, 'name', 'monster') || 'monster').replace(/ /g, '_') + ".aimon";
    link.click();
};

document.getElementById("upload-aimon-btn").onclick = () => document.getElementById("upload-aimon").click();
document.getElementById("upload-aimon").onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const obj = JSON.parse(evt.target.result);
            currentStatblock = obj;
            editing = false;
            render();
        } catch (err) {
            showError("Could not load .aimon file: " + err);
        }
    };
    reader.readAsText(file);
};

// Form submission handler
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('monster-form').onsubmit = function(e) {
        e.preventDefault();
        const prompt = document.getElementById('monster-prompt').value.trim();
        const model = document.getElementById('model-select').value;
        if (!prompt) return;

        currentStatblock = {};
        editing = false;
        render();
        showLoader();
        disableForm(true);

        fetch('/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({prompt, model})
        })
        .then(resp => {
            if (!resp.ok) {
                return resp.json().then(err => { throw new Error(err.error || `Request failed with status ${resp.status}`) });
            }
            return resp.json();
        })
        .then(data => {
            if (data.statblock) {
                currentStatblock = data.statblock;
                render();
            } else {
                throw new Error("Received a valid response, but it contained no statblock data.");
            }
        })
        .catch(err => {
            showError("Generation Error", err.message);
        })
        .finally(() => {
            disableForm(false);
        });
    };
    render(); // Initial render
});


// --- UI FEEDBACK (LOADERS, ERRORS) ---

function showLoader() {
    document.getElementById('statblock-container').innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loader-text">The AI is crafting your monster...</div>`;
}

function showError(title, message) {
    document.getElementById('statblock-container').innerHTML =
        `<div class="error-box">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>`;
}

function disableForm(disabled) {
    document.getElementById("monster-prompt").disabled = disabled;
    document.getElementById("model-select").disabled = disabled;
    document.querySelector("form button[type=submit]").disabled = disabled;
}