// Theme functionality
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    // Set initial theme
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️ Light Mode';
    }
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.textContent = '☀️ Light Mode';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.textContent = '🌓 Dark Mode';
            localStorage.setItem('theme', 'light');
        }
    });
}

// Tab functionality
function openTab(evt, tabName) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Remove active class from all tabs
    const tabs = document.getElementsByClassName('tab');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    
    // Show the current tab and add active class
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
    
    // Load content if not already loaded
    if (tabName !== 'generator' && document.getElementById(tabName).innerHTML.trim() === '') {
        loadTabContent(tabName);
    }
}

// Load content for a tab
function loadTabContent(tabName) {
    const tabContent = document.getElementById(tabName);
    if (!tabContent || !window.cheatsheetData || !window.cheatsheetData[tabName]) return;
    
    let content = '';
    window.cheatsheetData[tabName].forEach(section => {
        content += `
            <div class="section" id="${section.id}">
                <h2>${section.title}</h2>
                ${section.content}
            </div>
        `;
    });
    
    tabContent.innerHTML = content;
    
    // Add copy buttons to new code blocks
    tabContent.querySelectorAll('pre').forEach(pre => {
        addCopyButton(pre);
    });
    
    // Add collapsible functionality
    tabContent.querySelectorAll('.section h2').forEach(header => {
        const section = header.parentElement;
        const content = section.querySelectorAll(':not(h2)');
        const collapsible = document.createElement('div');
        collapsible.classList.add('collapsible');
        collapsible.style.maxHeight = 'none';
        
        // Wrap content in collapsible div
        content.forEach(el => {
            const clone = el.cloneNode(true);
            collapsible.appendChild(clone);
            el.remove();
        });
        
        section.appendChild(collapsible);
        
        // Add toggle button
        const btn = document.createElement('button');
        btn.classList.add('collapse-btn');
        btn.innerHTML = header.innerHTML;
        header.innerHTML = '';
        header.appendChild(btn);
        
        btn.addEventListener('click', function() {
            this.classList.toggle('collapsed');
            const content = this.parentElement.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
}

// Search functionality
function searchContent() {
    const input = document.getElementById('search');
    const filter = input.value.toUpperCase();
    const tabContents = document.getElementsByClassName('tab-content');
    
    for (let i = 0; i < tabContents.length; i++) {
        const sections = tabContents[i].getElementsByClassName('section');
        let foundInTab = false;
        
        for (let j = 0; j < sections.length; j++) {
            const text = sections[j].textContent || sections[j].innerText;
            const foundInSection = text.toUpperCase().indexOf(filter) > -1;
            
            if (foundInSection) {
                sections[j].style.display = '';
                foundInTab = true;
            } else {
                sections[j].style.display = 'none';
            }
        }
        
        // If search term found in tab, activate it
        if (foundInTab) {
            const tabId = tabContents[i].id;
            const tabs = document.getElementsByClassName('tab');
            for (let k = 0; k < tabs.length; k++) {
                if (tabs[k].getAttribute('onclick').includes(tabId)) {
                    tabs[k].click();
                    break;
                }
            }
        }
    }
}

// Copy button functionality
function addCopyButton(preElement) {
    // Skip if already has a copy button
    if (preElement.querySelector('.copy-btn')) return;
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', function() {
        const code = preElement.querySelector('code') || preElement;
        navigator.clipboard.writeText(code.textContent).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000);
        });
    });
    preElement.appendChild(copyBtn);
}

// Quick links functionality
document.querySelectorAll('.quick-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        
        // Determine which tab the target is in
        let targetTab = 'linux';
        if (targetId.startsWith('windows')) targetTab = 'windows';
        else if (targetId.startsWith('ad')) targetTab = 'ad';
        else if (targetId.startsWith('web')) targetTab = 'web';
        else if (targetId.startsWith('pwn')) targetTab = 'pwn';
        else if (targetId.startsWith('crypto')) targetTab = 'crypto';
        
        // Switch to the correct tab
        const tabs = document.getElementsByClassName('tab');
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].getAttribute('onclick').includes(targetTab)) {
                tabs[i].click();
                break;
            }
        }
        
        // Scroll to the target
        setTimeout(() => {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    });
});

// Cheatsheet Generator functionality
function initGenerator() {
    const categoryCheckboxes = document.getElementById('categoryCheckboxes');
    const sectionCheckboxes = document.getElementById('sectionCheckboxes');
    
    // Add category checkboxes
    Object.keys(window.cheatsheetData).forEach(category => {
        if (category === 'resources') return; // Skip resources
        
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `cat-${category}`;
        input.value = category;
        input.checked = true;
        input.addEventListener('change', updateSectionCheckboxes);
        
        const label = document.createElement('label');
        label.htmlFor = `cat-${category}`;
        label.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        
        div.appendChild(input);
        div.appendChild(label);
        categoryCheckboxes.appendChild(div);
    });
    
    // Initial section checkbox update
    updateSectionCheckboxes();
}

function updateSectionCheckboxes() {
    const sectionCheckboxes = document.getElementById('sectionCheckboxes');
    sectionCheckboxes.innerHTML = '';
    
    // Get selected categories
    const selectedCategories = Array.from(document.querySelectorAll('#categoryCheckboxes input:checked')).map(el => el.value);
    
    // Add section checkboxes for selected categories
    selectedCategories.forEach(category => {
        window.cheatsheetData[category].forEach(section => {
            const div = document.createElement('div');
            div.className = 'checkbox-item';
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `sec-${section.id}`;
            input.value = `${category}:${section.id}`;
            input.checked = true;
            
            const label = document.createElement('label');
            label.htmlFor = `sec-${section.id}`;
            label.textContent = section.title;
            
            div.appendChild(input);
            div.appendChild(label);
            sectionCheckboxes.appendChild(div);
        });
    });
}

function selectAllSections() {
    document.querySelectorAll('#sectionCheckboxes input').forEach(input => {
        input.checked = true;
    });
}

function deselectAllSections() {
    document.querySelectorAll('#sectionCheckboxes input').forEach(input => {
        input.checked = false;
    });
}

function generateCustomCheatsheet() {
    const selectedSections = Array.from(document.querySelectorAll('#sectionCheckboxes input:checked')).map(el => {
        const [category, id] = el.value.split(':');
        return { category, id };
    });
    
    let content = '<h1>Custom CTF Cheatsheet</h1>';
    
    // Group by category
    const sectionsByCategory = {};
    selectedSections.forEach(({ category, id }) => {
        if (!sectionsByCategory[category]) {
            sectionsByCategory[category] = [];
        }
        sectionsByCategory[category].push(id);
    });
    
    // Add sections
    Object.entries(sectionsByCategory).forEach(([category, sectionIds]) => {
        content += `<h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2>`;
        
        sectionIds.forEach(id => {
            const section = window.cheatsheetData[category].find(s => s.id === id);
            if (section) {
                content += `
                    <div class="section">
                        <h3>${section.title}</h3>
                        ${section.content}
                    </div>
                `;
            }
        });
    });
    
    // Display the custom cheatsheet
    const customCheatsheet = document.getElementById('customCheatsheet');
    const customContent = document.getElementById('customCheatsheetContent');
    customContent.innerHTML = content;
    customCheatsheet.style.display = 'block';
    
    // Add copy buttons to new code blocks
    customContent.querySelectorAll('pre').forEach(pre => {
        addCopyButton(pre);
    });
    
    // Scroll to the custom cheatsheet
    customCheatsheet.scrollIntoView({ behavior: 'smooth' });
}

function downloadCheatsheet() {
    const content = document.getElementById('customCheatsheetContent').innerHTML;
    const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Custom CTF Cheatsheet</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
                pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
                code { font-family: 'Courier New', monospace; }
                .section { margin-bottom: 20px; }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ctf-custom-cheatsheet.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize theme when script loads
initTheme();