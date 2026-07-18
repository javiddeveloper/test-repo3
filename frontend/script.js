/* ========================================
   Province/City Selector — JavaScript Logic
   ======================================== */

'use strict';

/**
 * Province and city data structure.
 * Each province has an id, name, and an array of cities.
 */
const PROVINCES = [
    {
        id: 'tehran',
        name: 'تهران',
        cities: [
            { id: 'tehran-city', name: 'تهران' },
            { id: 'varamin', name: 'ورامین' }
        ]
    },
    {
        id: 'isfahan',
        name: 'اصفهان',
        cities: [
            { id: 'isfahan-city', name: 'اصفهان' },
            { id: 'kashan', name: 'کاشان' }
        ]
    },
    {
        id: 'fars',
        name: 'فارس',
        cities: [
            { id: 'shiraz', name: 'شیراز' },
            { id: 'marvdasht', name: 'مرودشت' }
        ]
    }
];

/**
 * DOM element references — cached at startup.
 */
const provinceSelect = document.getElementById('province');
const citySelect = document.getElementById('city');
const resultDiv = document.getElementById('result');
const resetBtn = document.getElementById('resetBtn');

/**
 * Populates the province <select> with options from PROVINCES.
 */
function populateProvinces() {
    provinceSelect.innerHTML = '<option value="">— استان را انتخاب کنید —</option>';

    for (const province of PROVINCES) {
        const option = document.createElement('option');
        option.value = province.id;
        option.textContent = province.name;
        provinceSelect.appendChild(option);
    }
}

/**
 * Updates the city <select> options based on the selected province id.
 * If no province is selected, shows a placeholder message.
 *
 * @param {string} provinceId — The selected province id, or empty string.
 */
function updateCities(provinceId) {
    if (!provinceId) {
        citySelect.innerHTML = '<option value="">— ابتدا استان را انتخاب کنید —</option>';
        citySelect.disabled = true;
        return;
    }

    citySelect.disabled = false;

    const province = PROVINCES.find(function (p) {
        return p.id === provinceId;
    });

    if (!province) {
        citySelect.innerHTML = '<option value="">— استان نامعتبر است —</option>';
        citySelect.disabled = true;
        return;
    }

    citySelect.innerHTML = '<option value="">— شهر را انتخاب کنید —</option>';

    for (const city of province.cities) {
        const option = document.createElement('option');
        option.value = city.id;
        option.textContent = city.name;
        citySelect.appendChild(option);
    }
}

/**
 * Updates the result div with the current selection text.
 * Expects provinceSelect and citySelect to have their selected values.
 */
function updateResult() {
    const provinceOption = provinceSelect.options[provinceSelect.selectedIndex];
    const cityOption = citySelect.options[citySelect.selectedIndex];

    const provinceText = provinceOption ? provinceOption.textContent : '';
    const cityText = cityOption ? cityOption.textContent : '';

    if (!provinceSelect.value) {
        resultDiv.textContent = 'هیچ استانی انتخاب نشده است.';
        return;
    }

    if (!citySelect.value) {
        resultDiv.textContent = 'استان: ' + provinceText + ' — لطفاً شهر را انتخاب کنید.';
        return;
    }

    resultDiv.textContent = 'استان: ' + provinceText + '، شهر: ' + cityText;
}

/**
 * Handles change event on the province select.
 * Reads the selected value and cascades to city + result updates.
 */
function onProvinceChange() {
    const selectedProvinceId = provinceSelect.value;
    updateCities(selectedProvinceId);
    updateResult();
}

/**
 * Handles change event on the city select.
 * Re-renders the result text.
 */
function onCityChange() {
    updateResult();
}

/**
 * Resets both selects to empty and clears the result.
 */
function resetSelections() {
    provinceSelect.value = '';
    citySelect.innerHTML = '<option value="">— ابتدا استان را انتخاب کنید —</option>';
    citySelect.disabled = true;
    resultDiv.textContent = 'هیچ استانی انتخاب نشده است.';
}

/**
 * Attaches event listeners after DOM is ready.
 */
function init() {
    if (!provinceSelect || !citySelect || !resultDiv || !resetBtn) {
        console.error('SelectorApp: Required DOM elements not found.');
        return;
    }

    populateProvinces();
    resetSelections();

    provinceSelect.addEventListener('change', onProvinceChange);
    citySelect.addEventListener('change', onCityChange);
    resetBtn.addEventListener('click', resetSelections);
}

// Start the application when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
