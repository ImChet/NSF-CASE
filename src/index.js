const modules = [
    {
        "id": "module1",
        "groupID": "group1",
        "title": "Module 1: NMAP",
        "description": "NMAP Module that teaches you about the basics of reconnaissance of a remote target."
    },
    {
        "id": "module2",
        "groupID": "group1",
        "title": "Module 2",
        "description": "Description of Module 2 goes here."
    },
    {
        "id": "module3",
        "groupID": "group1",
        "title": "Module 3",
        "description": "Description of Module 3 goes here."
    },
    {
        "id": "module4",
        "groupID": "group1",
        "title": "Module 4",
        "description": "Description of Module 4 goes here."
    },
    {
        "id": "module5",
        "groupID": "group1",
        "title": "Module 5",
        "description": "Description of Module 5 goes here."
    },
    {
        "id": "module6",
        "groupID": "group2",
        "title": "Module 6",
        "description": "Description of Module 6 goes here."
    },
    {
        "id": "module7",
        "groupID": "group2",
        "title": "Module 7",
        "description": "Description of Module 7 goes here."
    },
    {
        "id": "module8",
        "groupID": "group2",
        "title": "Module 8",
        "description": "Description of Module 8 goes here."
    },
    {
        "id": "module9",
        "groupID": "group2",
        "title": "Module 9",
        "description": "Description of Module 9 goes here."
    },
    {
        "id": "module10",
        "groupID": "group2",
        "title": "Module 10",
        "description": "Description of Module 10 goes here."
    },
    {
        "id": "module11",
        "groupID": "group3",
        "title": "Module 11",
        "description": "Description of Module 11 goes here."
    },
    {
        "id": "module12",
        "groupID": "group3",
        "title": "Module 12",
        "description": "Description of Module 12 goes here."
    },
    {
        "id": "module13",
        "groupID": "group3",
        "title": "Module 13",
        "description": "Description of Module 13 goes here."
    },
    {
        "id": "module14",
        "groupID": "group3",
        "title": "Module 14",
        "description": "Description of Module 14 goes here."
    },
    {
        "id": "module15",
        "groupID": "group3",
        "title": "Module 15",
        "description": "Description of Module 15 goes here."
    },
    {
        "id": "module16",
        "groupID": "group4",
        "title": "Module 16",
        "description": "Description of Module 16 goes here."
    },
    {
        "id": "module17",
        "groupID": "group4",
        "title": "Module 17",
        "description": "Description of Module 17 goes here."
    },
    {
        "id": "module18",
        "groupID": "group4",
        "title": "Module 18",
        "description": "Description of Module 18 goes here."
    },
    {
        "id": "module19",
        "groupID": "group4",
        "title": "Module 19",
        "description": "Description of Module 19 goes here."
    },
    {
        "id": "module20",
        "groupID": "group4",
        "title": "Module 20",
        "description": "Description of Module 20 goes here."
    }
    ];

    const groupModules = [
    {
        "id": "group1",
        "groupID": "group1",
        "title": "Group 1"
    },
    {
        "id": "group2",
        "groupID": "group2",
        "title": "Group 2"
    },
    {
        "id": "group3",
        "groupID": "group3",
        "title": "Group 3"
    },
    {
        "id": "group4",
        "groupID": "group4",
        "title": "Group 4"
    },
    ];

// Function to create and append module elements
function createModuleElement(module, groupId) {
    const parentGroup = document.getElementById(groupId);

    const moduleTitle = document.createElement('h2');
    moduleTitle.className = 'hoverScale';
    moduleTitle.setAttribute('onclick', `toggleModule('${module.id}')`);
    moduleTitle.textContent = module.title;

    const moduleContent = document.createElement('div');
    moduleContent.id = module.id;
    moduleContent.className = 'moduleContent slideInUp';

    const moduleDescription = document.createElement('div');
    moduleDescription.className = 'description';
    moduleDescription.innerHTML = `<p>${module.description}</p>`;

    const initiateButton = document.createElement('button');
    initiateButton.className = 'initiateButton';
    initiateButton.setAttribute('onclick', `initiateModule('${module.id}')`);
    initiateButton.textContent = 'Initiate Module';

    moduleContent.appendChild(moduleDescription);
    moduleContent.appendChild(initiateButton);

    parentGroup.appendChild(moduleTitle);
    parentGroup.appendChild(moduleContent);
}

// Function to create and append group elements
function createGroupElement(group) {
    const groupTitle = document.createElement('h3');
    groupTitle.className = 'hoverScale';
    groupTitle.setAttribute('onclick', `toggleGroup('${group.id}')`);
    groupTitle.textContent = group.title;

    const groupContent = document.createElement('div');
    groupContent.id = `group_${group.id}`;
    groupContent.className = 'groupContent';
    groupContent.style.display = 'none'; // Initially hide the group content

    document.body.appendChild(groupTitle);
    document.body.appendChild(groupContent);
}

// Function to initialize the modules on page load
function initModules() {
    groupModules.forEach(group => {
        createGroupElement(group);
        modules.filter(module => module.groupID === group.id)
               .forEach(module => createModuleElement(module, `group_${group.id}`));
    });
}

function toggleGroup(groupId) {
    const groupContent = document.getElementById(`group_${groupId}`);
    const groupTitle = document.querySelector(`h3[onclick="toggleGroup('${groupId}')"]`);
    const isGroupExpanded = groupContent.style.display === 'block';

    if (!isGroupExpanded) {
        groupContent.style.display = 'block';
        groupTitle.classList.add('expandedGroup'); // Add expanded style
    } else {
        groupContent.style.display = 'none';
        groupTitle.classList.remove('expandedGroup'); // Remove expanded style
    }

    // Close all modules within this group
    const modulesInGroup = groupContent.querySelectorAll('.moduleContent');
    modulesInGroup.forEach(module => {
        module.style.display = 'none';
        const moduleId = module.id;
        const moduleHeading = document.querySelector(`h2[onclick="toggleModule('${moduleId}')"]`);
        moduleHeading.classList.remove('expandedHeading');
    });

    updateCollapseButtonVisibility(); // Update the visibility of the collapse button
}

function toggleModule(moduleId) {
    const moduleContent = document.getElementById(moduleId);
    const moduleHeading = document.querySelector(`h2[onclick="toggleModule('${moduleId}')"]`);
    const isExpanded = moduleContent.style.display === 'block';

    if (isExpanded) {
        moduleContent.style.display = 'none';
        moduleHeading.classList.remove('expandedHeading');
    } else {
        moduleContent.style.display = 'block';
        moduleHeading.classList.add('expandedHeading');
    }
    updateCollapseButtonVisibility();
}

function initiateModule(moduleId) {
    // Add logic to initiate the module (e.g., open terminal, start questions, etc.)
    console.log(`Module ${moduleId} initiated.`);

    // Generate the URL based on the module name and folder
    const moduleUrl = `Modules/html/${moduleId.toLowerCase()}.html`;

    // Redirect to the generated URL
    window.location.href = moduleUrl;
}

function updateCollapseButtonVisibility() {
    const moduleContents = document.querySelectorAll('.moduleContent');
    const visibleModules = Array.from(moduleContents).filter(module => module.style.display === 'block');

    const groupContents = document.querySelectorAll('.groupContent');
    const visibleGroups = Array.from(groupContents).filter(group => group.style.display === 'block');

    const collapseButton = document.getElementById('collapseButton');

    // Display the collapse button if more than one module or more than one group is open
    if (visibleModules.length > 1 || visibleGroups.length > 1) {
        collapseButton.style.display = 'block';
    } else {
        collapseButton.style.display = 'none';
    }
}

function collapseAll() {
    // Collapse all module contents
    const moduleContents = document.querySelectorAll('.moduleContent');
    moduleContents.forEach(module => {
        module.style.display = 'none';
        const moduleId = module.id;
        const moduleHeading = document.querySelector(`h2[onclick="toggleModule('${moduleId}')"]`);
        moduleHeading.classList.remove('expandedHeading');
    });

    // Collapse all group contents and remove expanded style from group headings
    const groupContents = document.querySelectorAll('.groupContent');
    groupContents.forEach(group => {
        group.style.display = 'none';
        const groupTitle = group.previousElementSibling; // Assuming h3 is right before the groupContent div
        if (groupTitle && groupTitle.classList.contains('expandedGroup')) {
            groupTitle.classList.remove('expandedGroup');
        }
    });

    // Hide the collapse button
    const collapseButton = document.getElementById('collapseButton');
    collapseButton.style.display = 'none';
}

// Window load event listener
window.addEventListener('load', initModules);