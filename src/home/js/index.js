const modules = [
    {
        "id": "module1",
        "groupID": "Comprehensive",
        "title": "Module 1: WannaCry",
        "description": "The WannaCry ransomware attack occurred in May 2017, targeting computers worldwide by encrypting files and demanding ransom payments in Bitcoin."
    },
    {
        "id": "module2",
        "groupID": "Comprehensive",
        "title": "Module 2: Target Breach",
        "description": "The 2013 cyber attack on Target involved a breach through a third-party vendor phishing attack, compromising millions of customer data and significantly impacting Target's reputation."
    },
    {
        "id": "module3",
        "groupID": "Comprehensive",
        "title": "Module 3: DDoS",
        "description": "In 2013, Distributed Denial of Service (DDoS) attacks peaking at a whopping 300 Gbps were initated against the website spamhaus.org lasting more than a week."
    },
    {
        "id": "module4",
        "groupID": "Comprehensive",
        "title": "Module 4: SolarWinds",
        "description": "The SolarWinds hack, discovered in December 2020, was a sophisticated cyberattack targeting SolarWinds, a prominent IT management software company."
    },
    {
        "id": "module5",
        "groupID": "Comprehensive",
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
    }
    ];

    const groupModules = [
    {
        "id": "Comprehensive",
        "groupID": "Comprehensive",
        "title": "Comprehensive"
    },
    {
        "id": "group2",
        "groupID": "group2",
        "title": "Group 2"
    }
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

    // Initiate Button Creation
    const initiateButton = document.createElement('button');
    initiateButton.className = 'initiateButton';
    initiateButton.setAttribute('onclick', `initiateModule('${module.id}')`);

    // Create the <span> tag for the button
    const buttonSpan = document.createElement('span');
    buttonSpan.textContent = 'Initiate Module';

    // Append the <span> tag to the button
    initiateButton.appendChild(buttonSpan);

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
    const moduleUrl = `/src/Modules/html/${moduleId.toLowerCase()}.html`;

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

    // Hide the collapse button to user
    const collapseButton = document.getElementById('collapseButton');
    collapseButton.style.display = 'none';
}

// Window load event listener
window.addEventListener('load', initModules);


// Handle Sign Out
document.addEventListener('DOMContentLoaded', function () {
    const signOutButton = document.getElementById('signOutButton');

    signOutButton.addEventListener('click', function () {
        fetch('http://localhost:3000/signout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-ID': localStorage.getItem('sessionId'),
            }
        })
        .then(response => {
            if (response.ok) {
                // Sign-out successful, clear the session ID from localStorage
                localStorage.removeItem('sessionId');
                // Redirect the user to the sign-in page or any other desired location
                window.location.href = '/src/authentication/html/signin.html';
            } else {
                // Handle sign-out error, you can show an alert or perform other actions
                console.error('Sign-out failed');
            }
        })
        .catch(error => {
            console.error('Error during sign-out:', error);
        });
    });
});
