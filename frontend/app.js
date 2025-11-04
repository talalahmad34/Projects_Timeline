// PES Projects Timeline Application
class PESTimeline {
  constructor() {
    this.ADMIN_PASSWORD = "6565";
    this.isAdmin = false;
    this.currentProjectId = null; // Track the currently viewed project ID
    this.undoTimeout = null;
    this.lastDeletedProjectData = null; // Store deleted project for undo

    // Get initial data from script tag
    const initialDataScript = document.getElementById('initialData');
    this.initialData = JSON.parse(initialDataScript.textContent);

    // Cache DOM elements
    this.messageBox = document.getElementById('messageBox');
    this.adminStatusSpan = document.getElementById('adminStatus');
    this.adminAccessBtn = document.getElementById('adminAccessBtn');
    this.addProjectBtn = document.getElementById('addProjectBtn');
    this.adminAccessModal = document.getElementById('adminAccessModal');
    this.adminPasswordInput = document.getElementById('adminPasswordInput');
    this.confirmAdminAccessBtn = document.getElementById('confirmAdminAccessBtn');
    this.projectFormModal = document.getElementById('projectFormModal');
    this.projectFormTitle = document.getElementById('projectFormTitle');
    this.projectForm = document.getElementById('projectForm');
    this.statusUpdateModal = document.getElementById('statusUpdateModal');
    this.statusUpdateFormTitle = document.getElementById('statusUpdateFormTitle');
    this.statusUpdateForm = document.getElementById('statusUpdateForm');
    this.homepageTitle = document.getElementById('homepageTitle');
    this.markProjectCompletedBtn = document.getElementById('markProjectCompletedBtn');
    this.addStatusUpdateBtn = document.getElementById('addStatusUpdateBtn'); 

    // Undo Banner elements
    this.undoBanner = document.getElementById('undoBanner');
    this.undoMessage = document.getElementById('undoMessage');
    this.undoButton = document.getElementById('undoButton');

    // Project Form Fields
    this.projectNameInput = document.getElementById('projectName');
    this.pesLeadInput = document.getElementById('pesLead');
    this.clientNameInput = document.getElementById('clientName');
    
    // New Survey and GI fields
    this.surveyStatusRadios = document.querySelectorAll('input[name="surveyStatus"]');
    this.giStatusRadios = document.querySelectorAll('input[name="giStatus"]');
    this.additionalDescriptionInput = document.getElementById('additionalDescription');


    // Detailed Project Features (existing)
    this.locationDistrictInput = document.getElementById('locationDistrict');
    this.damTypeInput = document.getElementById('damType');
    this.avgAnnualInflowInput = document.getElementById('avgAnnualInflow');
    this.grossStorageInput = document.getElementById('grossStorage');
    this.liveStorageInput = document.getElementById('liveStorage');
    this.nclMInput = document.getElementById('nclM');
    this.damWeirHeightMInput = document.getElementById('damWeirHeightM');
    this.crestElevationInput = document.getElementById('crestElevation');
    this.floodQCmsInput = document.getElementById('floodQCms');
    this.powerMWInput = document.getElementById('powerMW');
    this.ccaHectareInput = document.getElementById('ccaHectare');
    this.canalQCmsDrinkingWaterSupplyInput = document.getElementById('canalQCmsDrinkingWaterSupply');
    this.catchmentAreaSqkmInput = document.getElementById('catchmentAreaSqkm');
    this.sedimentLoadM3SqkmYrInput = document.getElementById('sedimentLoadM3SqkmYr');
    this.projectCostMRsInput = document.getElementById('projectCostMRs');

    // Date inputs
    this.startDateInput = document.getElementById('startDate');
    this.expectedEndDateInput = document.getElementById('expectedEndDate');

    // Status Update Form Fields
    this.updateDisplayDateInput = document.getElementById('updateDisplayDate'); // New Date field
    this.activityTaskInput = document.getElementById('activityTask'); 
    this.statusProgressTextInput = document.getElementById('statusProgressText'); 
    this.statusColorRadios = document.querySelectorAll('input[name="statusColor"]');
    this.updatedByInput = document.getElementById('updatedBy');

    this.initializeApp();
  }

  initializeApp() {
    this.bindEvents();
    this.setupFormDynamicFields(); // Setup dynamic fields based on initialData
    this.fetchProjects(); // Initial fetch when app loads
  }

  bindEvents() {
    this.homepageTitle.addEventListener('click', () => this.showProjectList());

    this.adminAccessBtn.addEventListener('click', () => {
      this.toggleModal('adminAccessModal', true);
      this.adminPasswordInput.focus();
      this.confirmAdminAccessBtn.dataset.action = 'grantAdmin';
    });

    this.adminPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.confirmAdminAccessBtn.click();
      }
    });

    this.confirmAdminAccessBtn.addEventListener('click', () => this.handleAdminLoginConfirmation());

    // Add New Project button event listener
    this.addProjectBtn.addEventListener('click', () => {
      this.openProjectFormForAdd();
    });

    // Add Status Update button event listener
    this.addStatusUpdateBtn.addEventListener('click', () => { 
        this.openStatusUpdateFormForAdd();
    });

    this.projectForm.addEventListener('submit', (e) => this.handleProjectSubmit(e));
    this.statusUpdateForm.addEventListener('submit', (e) => this.handleStatusUpdateSubmit(e));
    this.markProjectCompletedBtn.addEventListener('click', () => this.handleMarkProjectCompleted());
    this.undoButton.addEventListener('click', () => this.handleUndoDeletion());

    // Modal close buttons (shared logic)
    document.getElementById('projectFormModal').querySelector('.btn-secondary').addEventListener('click', () => this.toggleModal('projectFormModal', false));
    document.getElementById('statusUpdateModal').querySelector('.btn-secondary').addEventListener('click', () => this.toggleModal('statusUpdateModal', false));
    document.getElementById('adminAccessModal').querySelector('.btn-secondary').addEventListener('click', () => this.toggleModal('adminAccessModal', false));
    document.getElementById('backToProjectsBtn').addEventListener('click', () => this.showProjectList());

    // Global ESC key listener to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            this.toggleModal('adminAccessModal', false);
            this.toggleModal('projectFormModal', false);
            this.toggleModal('statusUpdateModal', false);
        }
    });
  }

  // --- Utility Functions ---
  showMessage(message, type = 'success') {
    this.messageBox.textContent = message;
    this.messageBox.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium z-50 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    this.messageBox.classList.remove('hidden');
    setTimeout(() => {
      this.messageBox.classList.add('hidden');
    }, 3000);
  }

  toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (show) {
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  }

  clearProjectForm() {
    this.projectForm.reset();
    this.projectForm.dataset.projectId = ''; // Clear project ID for new project
    // Clear all dynamically generated checkboxes
    document.querySelectorAll('#projectStageCheckboxesContainer .checkbox-item input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.closest('.checkbox-item').classList.remove('checked');
    });
    document.querySelectorAll('#projectScopeCheckboxesContainer .checkbox-item input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.closest('.checkbox-item').classList.remove('checked');
    });
    this.surveyStatusRadios.forEach(radio => radio.checked = false); 
    this.giStatusRadios.forEach(radio => radio.checked = false);     
  }

  clearStatusUpdateForm() {
    this.statusUpdateForm.reset();
    this.statusUpdateForm.dataset.updateId = ''; // Clear update ID for new update
    this.updateDisplayDateInput.valueAsDate = new Date(); // Set to current date by default
    document.getElementById('submitStatusUpdateFormBtn').textContent = 'Save Update';
    this.statusColorRadios.forEach(radio => radio.checked = (radio.value === 'Green')); // Default to 'On Track'
  }

  getSelectedCheckboxes(containerId) {
    return Array.from(document.querySelectorAll(`#${containerId} input[type="checkbox"]:checked`))
      .map(cb => cb.value);
  }

  setSelectedCheckboxes(containerId, values) {
    document.querySelectorAll(`#${containerId} input[type="checkbox"]`).forEach(cb => {
      const isChecked = values.includes(cb.value);
      cb.checked = isChecked;
      cb.closest('.checkbox-item').classList.toggle('checked', isChecked);
    });
  }
  
  getCheckedRadioValue(radioElements) {
    for (const radio of radioElements) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return ''; // Return empty string if none selected
  }

  setCheckedRadioValue(radioElements, value) {
    radioElements.forEach(radio => {
        radio.checked = (radio.value === value);
    });
  }

  showUndoBanner(projectName) {
    if (this.undoTimeout) clearTimeout(this.undoTimeout);
    this.undoMessage.textContent = `"${projectName}" deleted.`;
    this.undoBanner.classList.add('show');
    this.undoTimeout = setTimeout(() => {
      this.undoBanner.classList.remove('show');
      this.lastDeletedProjectData = null;
    }, 10000); // 10 seconds
  }

  hideUndoBanner() {
    if (this.undoTimeout) clearTimeout(this.undoTimeout);
    this.undoBanner.classList.remove('show');
    this.lastDeletedProjectData = null;
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    // Use toLocaleDateString without time
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  // New method to set up dynamic fields in modals (stages, scopes)
  setupFormDynamicFields() {
    // Project Stages
    const stagesContainer = document.getElementById('projectStageCheckboxesContainer');
    stagesContainer.innerHTML = ''; // Clear existing
    this.initialData.project_stages.forEach(stage => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `
            <input type="checkbox" id="stage-${stage.replace(/\s+/g, '')}" value="${stage}">
            <label for="stage-${stage.replace(/\s+/g, '')}">${stage}</label>
        `;
        div.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') { // Toggle checkbox if click is on div/label
                const checkbox = div.querySelector('input');
                checkbox.checked = !checkbox.checked;
            }
            div.classList.toggle('checked', div.querySelector('input').checked);
        });
        stagesContainer.appendChild(div);
    });

    // Project Scopes
    const scopesContainer = document.getElementById('projectScopeCheckboxesContainer');
    scopesContainer.innerHTML = ''; // Clear existing
    this.initialData.project_scopes.forEach(scope => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `
            <input type="checkbox" id="scope-${scope.replace(/\s+/g, '')}" value="${scope}">
            <label for="scope-${scope.replace(/\s+/g, '')}">${scope}</label>
        `;
        div.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT') { // Toggle checkbox if click is on div/label
                const checkbox = div.querySelector('input');
                checkbox.checked = !checkbox.checked;
            }
            div.classList.toggle('checked', div.querySelector('input').checked);
        });
        scopesContainer.appendChild(div);
    });
  }

  // --- Admin & Authentication ---
  handleAdminLoginConfirmation() {
    const password = this.adminPasswordInput.value;
    const action = this.confirmAdminAccessBtn.dataset.action;
    const updateId = this.confirmAdminAccessBtn.dataset.updateId;
    const projectId = this.confirmAdminAccessBtn.dataset.projectId;

    if (password === this.ADMIN_PASSWORD) {
      this.isAdmin = true;
      this.adminStatusSpan.textContent = 'Admin Mode: On';
      this.adminStatusSpan.classList.remove('text-red-500');
      this.adminStatusSpan.classList.add('text-green-500');
      this.addProjectBtn.classList.remove('hidden');
      this.showMessage('Admin access granted!', 'success');
      this.toggleModal('adminAccessModal', false); // Close modal

      if (action === 'editUpdate' && updateId) {
        this.openStatusUpdateFormForEdit(updateId, this.currentProjectId);
      } else if (action === 'editProject' && projectId) {
        this.openProjectFormForEdit(projectId);
      } else if (action === 'deleteProject' && projectId) {
        this.deleteProject(projectId, password);
      } else {
        this.fetchProjects(); // Re-fetch to show edit/delete buttons if not already in project view
        if (this.currentProjectId) { // If in project details, re-render it
            this.showProjectDetails(this.currentProjectId);
        }
      }
    } else {
      this.showMessage('Invalid admin password!', 'error');
      this.adminPasswordInput.value = '';
      this.adminPasswordInput.focus();
    }
  }

  // --- Project Management ---
  async fetchProjects() {
    try {
      const response = await axios.get('/api/projects');
      const projects = response.data;
      this.renderProjects(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      this.showMessage('Failed to load projects from database.', 'error');
    }
  }

  renderProjects(projects) {
    const projectListDiv = document.getElementById('projectList');
    projectListDiv.innerHTML = '';
    document.getElementById('projectDetail').classList.add('hidden');
    projectListDiv.classList.remove('hidden');

    const activeProjects = projects.filter(p => p.status === 'active');
    const completedProjects = projects.filter(p => p.status === 'completed');

    if (activeProjects.length > 0) {
      projectListDiv.innerHTML += '<h2 class="col-span-full text-2xl font-semibold text-gray-800 mb-4">Active Projects</h2>';
      activeProjects.forEach(project => {
        projectListDiv.innerHTML += this.createProjectCard(project);
      });
    } else {
      projectListDiv.innerHTML += '<p class="col-span-full text-gray-600">No active projects to display.</p>';
    }

    if (completedProjects.length > 0) {
      projectListDiv.innerHTML += '<h2 class="col-span-full text-2xl font-semibold text-gray-800 mt-8 mb-4">Completed Projects</h2>';
      completedProjects.forEach(project => {
        projectListDiv.innerHTML += this.createProjectCard(project);
      });
    } else {
      projectListDiv.innerHTML += '<p class="col-span-full text-gray-600 mt-4">No completed projects to display.</p>';
    }

    // Attach event listeners to newly created edit and delete buttons
    document.querySelectorAll('.edit-project-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click
        if (!this.isAdmin) {
          this.toggleModal('adminAccessModal', true);
          this.adminPasswordInput.focus();
          this.confirmAdminAccessBtn.dataset.action = 'editProject';
          this.confirmAdminAccessBtn.dataset.projectId = button.dataset.projectId;
          return;
        }
        this.openProjectFormForEdit(button.dataset.projectId);
      });
    });

    document.querySelectorAll('.delete-project-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click
        const projectIdToDelete = button.dataset.projectId;
        const projectNameToDelete = button.dataset.projectName;
        if (!this.isAdmin) {
          this.toggleModal('adminAccessModal', true);
          this.adminPasswordInput.focus();
          this.confirmAdminAccessBtn.dataset.action = 'deleteProject';
          this.confirmAdminAccessBtn.dataset.projectId = projectIdToDelete;
          return;
        }
        // If admin, confirm deletion directly
        if (confirm(`Are you sure you want to delete project "${projectNameToDelete}"? This cannot be undone after 10 seconds.`)) {
          this.deleteProject(projectIdToDelete, this.ADMIN_PASSWORD);
        }
      });
    });
  }

  createProjectCard(project) {
    const lastUpdated = project.last_updated_at ? this.formatDate(project.last_updated_at) : 'N/A';
    const lastUpdatedBy = project.last_updated_by || 'N/A';
    const statusClass = project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
    
    // Pencil icon for edit button
    const editButtonHtml = this.isAdmin ? `
        <button class="edit-project-btn text-pes-orange hover:text-pes-orange-dark transition duration-300" data-project-id="${project.id}" title="Edit Project">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                <path d="M16 6l4 4"></path>
            </svg>
        </button>
    ` : '';

    // Trash can icon for delete button (FIXED SVG PATH)
    const deleteButtonHtml = this.isAdmin ? `
        <button class="delete-project-btn text-red-500 hover:text-red-700 transition duration-300 ml-2" data-project-id="${project.id}" data-project-name="${project.project_name}" title="Delete Project">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
        </button>
    ` : '';

    return `
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition duration-300 cursor-pointer flex flex-col justify-between" onclick="app.showProjectDetails(${project.id})">
            <div>
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-xl font-semibold text-gray-800">${project.project_name}</h3>
                    <div class="flex items-center">
                        ${editButtonHtml}
                        ${deleteButtonHtml}
                    </div>
                </div>
                <p class="text-sm font-medium ${statusClass} rounded-full px-3 py-1 inline-block mb-2">${project.status.charAt(0).toUpperCase() + project.status.slice(1)}</p>
                <p class="text-gray-600 mb-1"><strong>Lead:</strong> ${project.pes_lead}</p>
                <p class="text-gray-600 mb-1"><strong>Client:</strong> ${project.client_name}</p>
                <p class="text-gray-500 text-sm">Last Update: ${lastUpdated} by ${lastUpdatedBy}</p>
            </div>
        </div>
    `;
  }

  async showProjectDetails(projectId) {
    this.currentProjectId = projectId; // Set global project ID
    try {
      const response = await axios.get(`/api/projects/${projectId}`);
      const project = response.data;

      document.getElementById('projectList').classList.add('hidden');
      document.getElementById('projectDetail').classList.remove('hidden');

      document.getElementById('projectDetailName').textContent = project.project_name;
      document.getElementById('projectDetailLead').textContent = project.pes_lead;
      document.getElementById('projectDetailClient').textContent = project.client_name;
      document.getElementById('projectDetailStage').textContent = Array.isArray(project.project_stage) ? project.project_stage.join(', ') : project.project_stage || 'N/A';
      document.getElementById('projectDetailScope').textContent = Array.isArray(project.project_scope) ? project.project_scope.join(', ') : project.project_scope || 'N/A';
      document.getElementById('projectDetailStartDate').textContent = project.start_date;
      document.getElementById('projectDetailEndDate').textContent = project.expected_end_date;
      document.getElementById('projectDetailLastUpdate').textContent = project.last_updated_at ? this.formatDate(project.last_updated_at) : 'N/A';
      document.getElementById('projectDetailLastUpdater').textContent = project.last_updated_by || 'N/A';

      // Display new Survey and GI Statuses
      document.getElementById('projectDetailSurveyStatus').textContent = project.survey_status || 'N/A';
      document.getElementById('projectDetailGIStatus').textContent = project.gi_status || 'N/A';
      document.getElementById('projectDetailAdditionalDescription').textContent = project.additional_description || 'N/A';

      // Display new detailed features - Ensure elements are correctly assigned
      document.getElementById('projectDetailLocation').textContent = project.location_district || 'N/A';
      document.getElementById('projectDetailDamType').textContent = project.dam_type || 'N/A';
      document.getElementById('projectDetailInflow').textContent = project.avg_annual_inflow_mcm || 'N/A';
      document.getElementById('projectDetailGrossStorage').textContent = project.gross_storage_mcm || 'N/A';
      document.getElementById('projectDetailLiveStorage').textContent = project.live_storage_mcm || 'N/A';
      document.getElementById('projectDetailNCL').textContent = project.ncl_m || 'N/A';
      document.getElementById('projectDetailDamHeight').textContent = project.dam_weir_height_m || 'N/A';
      document.getElementById('projectDetailCrestElevation').textContent = project.crest_elevation || 'N/A';
      document.getElementById('projectDetailFloodQ').textContent = project.flood_q_cms || 'N/A';
      this.powerMWInput = project.power_mw || ''; // Fix: this should be document.getElementById('powerMW').textContent = project.power_mw || 'N/A';
      document.getElementById('projectDetailPower').textContent = project.power_mw || 'N/A'; // Corrected ID
      document.getElementById('projectDetailCCA').textContent = project.cca_hectare || 'N/A';
      document.getElementById('projectDetailCanalQ').textContent = project.canal_q_cms_drinking_water_supply || 'N/A';
      document.getElementById('projectDetailCatchmentArea').textContent = project.catchment_area_sqkm || 'N/A';
      document.getElementById('projectDetailSedimentLoad').textContent = project.sediment_load_m3_sqkm_yr || 'N/A';
      document.getElementById('projectDetailCost').textContent = project.project_cost_m_rs || 'N/A';


      this.renderTimeline(project.updates);

      // Show/hide 'Mark Project Completed' button
      if (this.isAdmin && project.status === 'active') {
        this.markProjectCompletedBtn.classList.remove('hidden');
      } else {
        this.markProjectCompletedBtn.classList.add('hidden');
      }

      // Show/hide 'Add Status Update' button
      if (project.status === 'active') {
        this.addStatusUpdateBtn.classList.remove('hidden');
      } else {
        this.addStatusUpdateBtn.classList.add('hidden');
      }

    } catch (error) {
      console.error('Error fetching project details:', error);
      this.showMessage('Failed to load project details.', 'error');
    }
  }

  renderTimeline(updates) {
    const timelineContainer = document.getElementById('timelineContainer');
    timelineContainer.innerHTML = '';

    if (updates.length === 0) {
      timelineContainer.innerHTML = '<p class="text-gray-600">No status updates yet.</p>';
      return;
    }

    // Sort updates by update_display_date (newest first)
    updates.sort((a, b) => new Date(b.update_display_date) - new Date(a.update_display_date));

    // Group updates by year and then by month based on update_display_date
    const updatesByYear = {};
    updates.forEach(update => {
      const updateDate = new Date(update.update_display_date);
      const year = updateDate.getFullYear();
      const month = updateDate.getMonth(); // 0-indexed

      if (!updatesByYear[year]) {
        updatesByYear[year] = {};
      }
      if (!updatesByYear[year][month]) {
        updatesByYear[year][month] = [];
      }
      updatesByYear[year][month].push(update);
    });

    // Declare and initialize currentDate, currentYear, currentMonth
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    for (const year in updatesByYear) {
      const yearSummaryId = `year-summary-${year}`;
      const yearDetails = document.createElement('details');
      yearDetails.classList.add('mb-6');
      yearDetails.setAttribute('id', yearSummaryId);
      // Expand current year by default
      if (parseInt(year) === currentYear) {
        yearDetails.setAttribute('open', '');
      }

      yearDetails.innerHTML = `<summary class="text-xl font-semibold text-gray-800 cursor-pointer py-2">${year}</summary>`;
      
      const yearContentDiv = document.createElement('div');
      yearDetails.appendChild(yearContentDiv);

      for (const month in updatesByYear[year]) {
        const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
        const monthSummaryId = `month-summary-${year}-${month}`;
        const monthDetails = document.createElement('details');
        monthDetails.classList.add('mb-4', 'ml-4');
        monthDetails.setAttribute('id', monthSummaryId);
        // Expand current month of current year by default
        if (parseInt(year) === currentYear && parseInt(month) === currentMonth) {
          monthDetails.setAttribute('open', '');
        }

        monthDetails.innerHTML = `
          <summary class="text-lg font-medium text-gray-700 cursor-pointer py-1">
              ${monthName} ${year}
              <button class="export-report-btn ml-4 px-3 py-1 bg-pes-orange hover:bg-pes-orange-dark text-white text-sm rounded-lg transition duration-300 hidden" data-month="${month}" data-year="${year}">Export Report</button>
          </summary>
        `;
        const monthTimelineDiv = document.createElement('div');
        monthDetails.appendChild(monthTimelineDiv);

        updatesByYear[year][month].forEach(update => {
          const updateDate = new Date(update.update_display_date); // Use update_display_date for rendering
          const formattedDate = this.formatDate(update.update_display_date); // Use formatDate for consistent format

          const statusClass = update.status_color.toLowerCase(); // green, orange, red

          const editButtonHtml = this.isAdmin ? `
              <button class="edit-timeline-btn text-pes-orange hover:underline font-medium text-sm ml-4" data-update-id="${update.id}" data-project-id="${this.currentProjectId}">Edit</button>
          ` : '';

          // Reordered content according to user's request
          monthTimelineDiv.innerHTML += `
              <div class="timeline-item ${statusClass} bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
                  <div class="flex justify-between items-start mb-1">
                      <p class="text-gray-800 font-semibold text-base">Activity / Task: <span class="font-normal">${update.update_text}</span></p>
                      ${editButtonHtml}
                  </div>
                  <p class="text-gray-700 text-sm mb-1">Current Progress: ${update.status_progress_text || 'N/A'}</p>
                  <p class="text-sm text-gray-500 mb-1">Updated By: ${update.updated_by}</p>
                  <p class="text-sm text-gray-500">${formattedDate}</p>
              </div>
          `;
        });
        yearContentDiv.appendChild(monthDetails);
      }
      timelineContainer.appendChild(yearDetails);
    }

    // Attach event listeners for edit buttons
    document.querySelectorAll('.edit-timeline-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent month detail from toggling
        const updateId = e.target.dataset.updateId;
        const projectId = e.target.dataset.projectId;
        this.toggleModal('adminAccessModal', true); // Show admin password modal first
        this.adminPasswordInput.focus();
        this.confirmAdminAccessBtn.dataset.action = 'editUpdate';
        this.confirmAdminAccessBtn.dataset.updateId = updateId;
      });
    });

    // Attach event listeners for export report buttons
    document.querySelectorAll('.export-report-btn').forEach(button => {
      const buttonMonth = parseInt(button.dataset.month);
      const buttonYear = parseInt(button.dataset.year);
      const dateForMonth = new Date(buttonYear, buttonMonth);
      if (dateForMonth <= currentDate) { 
        button.classList.remove('hidden');
      }
      button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent month detail from toggling
        this.generatePdfReport(this.currentProjectId, buttonYear, buttonMonth);
      });
    });
  }

  // Helper object to map status colors to descriptive names for PDF
  getStatusDescription(color) {
      switch(color) {
          case 'Green': return 'On Track';
          case 'Orange': return 'Minor Issues';
          case 'Red': return 'Significant Issues';
          default: return color;
      }
  }

  async generatePdfReport(projectId, year, month) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
    const projectResponse = await axios.get(`/api/projects/${projectId}`); 
    const project = projectResponse.data;
    const projectName = project.project_name;

    // Filter updates for the specific month and year
    const updatesForMonth = project.updates.filter(update => {
        const updateDate = new Date(update.update_display_date);
        return updateDate.getFullYear() === parseInt(year) && updateDate.getMonth() === parseInt(month); 
    });
    // Sort updates by display date for PDF
    updatesForMonth.sort((a, b) => new Date(a.update_display_date) - new Date(b.update_display_date));


    doc.setFontSize(18);
    doc.text(`Project: ${projectName}`, 15, 15);
    doc.setFontSize(14);
    doc.text(`Timeline Report - ${monthName} ${year}`, 15, 25);
    doc.setFontSize(10);
    doc.text(`Report Generated: ${this.formatDate(new Date().toISOString())}`, 15, 35);


    // --- Project Details Section ---
    let y = 50; // Starting Y position for content
    const margin = 15;
    const columnWidth = 85; // Roughly half page width minus margins
    const lineHeight = 6; // Standard line height for smaller text

    // Basic Info
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Project Details:', margin, y);
    doc.setFont(undefined, 'normal');
    y += lineHeight + 2; // Add a bit more space

    const projectDetails = [
        { label: 'Team Leader:', value: project.pes_lead },
        { label: 'Client Name:', value: project.client_name },
        { label: 'Project Stage:', value: Array.isArray(project.project_stage) ? project.project_stage.join(', ') : project.project_stage },
        { label: 'Project Scope:', value: Array.isArray(project.project_scope) ? project.project_scope.join(', ') : project.project_scope },
        { label: 'Start Date:', value: project.start_date },
        { label: 'End Date:', value: project.expected_end_date },
        { label: 'Survey Status:', value: project.survey_status },
        { label: 'GI Status:', value: project.gi_status }
    ];

    projectDetails.forEach((detail, index) => {
        const lines = doc.splitTextToSize(`${detail.label} ${detail.value || 'N/A'}`, columnWidth - 5); // Allow some padding
        if (index % 2 === 0) { // First column
            doc.text(lines, margin, y);
            if (lines.length > 1) y += (lines.length -1) * lineHeight; // Adjust y for multiline
        } else { // Second column
            doc.text(lines, margin + columnWidth, y);
            y += (Math.max(lines.length, (projectDetails[index-1] ? doc.splitTextToSize(`${projectDetails[index-1].label} ${projectDetails[index-1].value || 'N/A'}`, columnWidth - 5).length : 1))) * lineHeight; // Move y down by max lines in pair
        }
    });

    if (project.additional_description) {
        y += lineHeight; // Extra space
        doc.setFont(undefined, 'bold');
        doc.text('Additional Description:', margin, y);
        doc.setFont(undefined, 'normal');
        y += lineHeight;
        const descLines = doc.splitTextToSize(project.additional_description, (columnWidth * 2) - 5);
        doc.text(descLines, margin, y);
        y += descLines.length * lineHeight;
    }

    y += 10;
    doc.line(margin, y, doc.internal.pageSize.width - margin, y); // Separator
    y += 10;

    // --- Project Specifications Section ---
    doc.setFont(undefined, 'bold');
    doc.text('Project Specifications:', margin, y);
    doc.setFont(undefined, 'normal');
    y += lineHeight + 2;

    const specs = [
        { label: 'Location/District:', value: project.location_district },
        { label: 'Dam Type:', value: project.dam_type },
        { label: 'Avg. Annual Inflow (MCM):', value: project.avg_annual_inflow_mcm },
        { label: 'Gross Storage (MCM):', value: project.gross_storage_mcm },
        { label: 'Live Storage (MCM):', value: project.live_storage_mcm },
        { label: 'NCL (m):', value: project.ncl_m },
        { label: 'Dam / Weir Height(m):', value: project.dam_weir_height_m },
        { label: 'Crest Elevation:', value: project.crest_elevation },
        { label: 'Flood "Q" (Cms):', value: project.flood_q_cms },
        { label: 'Power (MW):', value: project.power_mw },
        { label: 'CCA (Hectare):', value: project.cca_hectare },
        { label: 'Canal "Q" (Cms), Drinking Water Supply:', value: project.canal_q_cms_drinking_water_supply },
        { label: 'Catchment Area (Sq.km):', value: project.catchment_area_sqkm },
        { label: 'Sediment Load (M3/SQ.Km/Yr):', value: project.sediment_load_m3_sqkm_yr },
        { label: 'Project Cost (M. Rs):', value: project.project_cost_m_rs }
    ];

    const specsCol1X = margin;
    const specsCol2X = margin + columnWidth; // Use same column width as project details
    const specsColWidth = columnWidth - 5; // Text width for specs column

    for (let i = 0; i < specs.length; i += 2) {
        if (y > doc.internal.pageSize.height - (margin * 2)) { // Check for new page
            doc.addPage();
            y = margin;
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text('Project Specifications (Cont.):', margin, y);
            doc.setFont(undefined, 'normal');
            y += lineHeight + 2;
        }

        const lines1 = doc.splitTextToSize(`${specs[i].label} ${specs[i].value || 'N/A'}`, specsColWidth);
        doc.text(lines1, specsCol1X, y);
        let maxLinesInRow = lines1.length;

        if (specs[i + 1]) {
            const lines2 = doc.splitTextToSize(`${specs[i + 1].label} ${specs[i + 1].value || 'N/A'}`, specsColWidth);
            doc.text(lines2, specsCol2X, y);
            maxLinesInRow = Math.max(maxLinesInRow, lines2.length);
        }
        y += maxLinesInRow * lineHeight;
    }

    y += 10;
    doc.line(margin, y, doc.internal.pageSize.width - margin, y); // Separator before timeline updates
    y += 10;
    
    // --- Timeline Updates Section ---
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Status Updates:', margin, y);
    doc.setFont(undefined, 'normal');
    y += 10;


    // Column headers for PDF timeline updates
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Date', margin, y);
    doc.text('Status', margin + 25, y); // Adjusted X for status
    doc.text('Activity / Task', margin + 60, y); // Adjusted X for activity
    doc.text('Current Progress', margin + 110, y); // Adjusted X for progress
    doc.text('Updated By', margin + 160, y); // Adjusted X for updated by
    y += 5;
    doc.line(margin, y, doc.internal.pageSize.width - margin, y); // Draw a line under headers
    y += 10;
    doc.setFont(undefined, 'normal');


    if (updatesForMonth.length === 0) {
        doc.text('No updates found for this month.', margin, y);
    } else {
        for (const update of updatesForMonth) {
            const updateDate = new Date(update.update_display_date);
            const formattedDate = updateDate.toLocaleDateString();
            const statusDesc = this.getStatusDescription(update.status_color); 
            
            // Using a fixed width for columns, adjust as needed. Max 210 for A4 width.
            // Split text to fit within column width
            const activityTaskLines = doc.splitTextToSize(update.update_text, 45); // Increased width
            const progressLines = doc.splitTextToSize(update.status_progress_text || 'N/A', 45); // Increased width
            const updatedByLines = doc.splitTextToSize(update.updated_by, 25); 

            const currentUpdateMaxLines = Math.max(
                activityTaskLines.length, 
                progressLines.length,
                updatedByLines.length,
                1 // Ensure at least one line height
            );
            const updateHeight = currentUpdateMaxLines * lineHeight + 5; // Add extra padding

            // Check if content fits on page, add new page if not
            if (y + updateHeight > doc.internal.pageSize.height - (margin * 2)) { // Adjusted bottom margin
                doc.addPage();
                y = margin; // Reset Y for new page
                doc.setFontSize(10);
                doc.setFont(undefined, 'bold');
                doc.text('Date', margin, y);
                doc.text('Status', margin + 25, y);
                doc.text('Activity / Task', margin + 60, y);
                doc.text('Current Progress', margin + 110, y);
                doc.text('Updated By', margin + 160, y);
                y += 5;
                doc.line(margin, y, doc.internal.pageSize.width - margin, y);
                y += 10;
                doc.setFont(undefined, 'normal');
            }

            doc.setFontSize(8); 
            doc.text(formattedDate, margin, y);
            doc.text(statusDesc, margin + 25, y);
            doc.text(activityTaskLines, margin + 60, y); 
            doc.text(progressLines, margin + 110, y);    
            doc.text(updatedByLines, margin + 160, y); 
            
            y += updateHeight; 
            doc.line(margin, y - 2, doc.internal.pageSize.width - margin, y - 2); 
            y += 5; 
        }
    }

    doc.save(`${projectName}_Timeline_${monthName}_${year}.pdf`);
  }

  showProjectList() {
    this.currentProjectId = null;
    document.getElementById('projectDetail').classList.add('hidden');
    document.getElementById('projectList').classList.remove('hidden');
    this.fetchProjects(); 
  }

  openProjectFormForAdd() {
    this.projectFormTitle.textContent = 'Add New Project';
    this.clearProjectForm();
    this.toggleModal('projectFormModal', true);
    this.projectNameInput.focus();
  }

  async openProjectFormForEdit(projectId) {
    try {
      const response = await axios.get(`/api/projects/${projectId}`);
      const project = response.data;

      this.projectFormTitle.textContent = `Edit Project: ${project.project_name}`;
      this.projectForm.dataset.projectId = projectId;

      this.projectNameInput.value = project.project_name;
      this.pesLeadInput.value = project.pes_lead;
      this.clientNameInput.value = project.client_name;
      this.startDateInput.value = project.start_date;
      this.expectedEndDateInput.value = project.expected_end_date;

      this.setSelectedCheckboxes('projectStageCheckboxesContainer', project.project_stage);
      this.setSelectedCheckboxes('projectScopeCheckboxesContainer', project.project_scope);

      this.setCheckedRadioValue(this.surveyStatusRadios, project.survey_status);
      this.setCheckedRadioValue(this.giStatusRadios, project.gi_status);
      this.additionalDescriptionInput.value = project.additional_description || '';

      this.locationDistrictInput.value = project.location_district || '';
      this.damTypeInput.value = project.dam_type || '';
      this.avgAnnualInflowInput.value = project.avg_annual_inflow_mcm || '';
      this.grossStorageInput.value = project.gross_storage_mcm || '';
      this.liveStorageInput.value = project.live_storage_mcm || '';
      this.nclMInput.value = project.ncl_m || '';
      this.damWeirHeightMInput.value = project.dam_weir_height_m || '';
      this.crestElevationInput.value = project.crest_elevation || '';
      this.floodQCmsInput.value = project.flood_q_cms || '';
      document.getElementById('powerMW').value = project.power_mw || ''; // Corrected assignment for powerMW
      this.ccaHectareInput.value = project.cca_hectare || '';
      this.canalQCmsDrinkingWaterSupplyInput.value = project.canal_q_cms_drinking_water_supply || '';
      this.catchmentAreaSqkmInput.value = project.catchment_area_sqkm || '';
      this.sedimentLoadM3SqkmYrInput.value = project.sediment_load_m3_sqkm_yr || '';
      this.projectCostMRsInput.value = project.project_cost_m_rs || '';


      this.toggleModal('projectFormModal', true);
    } catch (error) {
      console.error('Error opening project form for edit:', error);
      this.showMessage('Failed to load project for editing.', 'error');
    }
  }

  async handleProjectSubmit(e) {
    e.preventDefault();
    const isEdit = this.projectForm.dataset.projectId ? true : false;
    const projectId = this.projectForm.dataset.projectId;

    const selectedProjectStages = this.getSelectedCheckboxes('projectStageCheckboxesContainer');
    const selectedProjectScopes = this.getSelectedCheckboxes('projectScopeCheckboxesContainer');
    const surveyStatus = this.getCheckedRadioValue(this.surveyStatusRadios); 
    const giStatus = this.getCheckedRadioValue(this.giStatusRadios);         

    const projectData = {
      project_name: this.projectNameInput.value,
      pes_lead: this.pesLeadInput.value,
      client_name: this.clientNameInput.value,
      project_stage: selectedProjectStages, 
      project_scope: selectedProjectScopes, 
      start_date: this.startDateInput.value,
      expected_end_date: this.expectedEndDateInput.value,

      location_district: this.locationDistrictInput.value,
      dam_type: this.damTypeInput.value,
      avg_annual_inflow_mcm: this.avgAnnualInflowInput.value,
      gross_storage_mcm: this.grossStorageInput.value,
      live_storage_mcm: this.liveStorageInput.value,
      ncl_m: this.nclMInput.value,
      dam_weir_height_m: this.damWeirHeightMInput.value, 
      crest_elevation: this.crestElevationInput.value,
      flood_q_cms: this.floodQCmsInput.value,
      power_mw: this.powerMWInput.value, // Corrected assignment for powerMW
      cca_hectare: this.ccaHectareInput.value,
      canal_q_cms_drinking_water_supply: this.canalQCmsDrinkingWaterSupplyInput.value,
      catchment_area_sqkm: this.catchmentAreaSqkmInput.value,
      sediment_load_m3_sqkm_yr: this.sedimentLoadM3SqkmYrInput.value,
      project_cost_m_rs: this.projectCostMRsInput.value,
      
      survey_status: surveyStatus, 
      gi_status: giStatus,         
      additional_description: this.additionalDescriptionInput.value, 

      admin_password: this.ADMIN_PASSWORD 
    };

    try {
      let response;
      if (isEdit) {
        response = await axios.put(`/api/admin/projects/${projectId}`, projectData);
        this.showMessage('Project updated successfully!', 'success');
      } else {
        response = await axios.post('/api/admin/projects', projectData);
        this.showMessage('Project added successfully!', 'success');
      }
      this.toggleModal('projectFormModal', false);
      this.fetchProjects(); 
    } catch (error) {
      console.error('Error saving project:', error);
      this.showMessage('Failed to save project. Check console for details.', 'error');
    }
  }

  openStatusUpdateFormForAdd() {
    if (!this.currentProjectId) {
      this.showMessage('Please select a project first to add a status update.', 'error');
      return;
    }
    this.statusUpdateFormTitle.textContent = 'Add Status Update';
    this.clearStatusUpdateForm();
    this.toggleModal('statusUpdateModal', true);
    this.updateDisplayDateInput.valueAsDate = new Date(); 
    this.activityTaskInput.focus();
  }

  async openStatusUpdateFormForEdit(updateId, projectId) {
    this.toggleModal('statusUpdateModal', true);
    this.statusUpdateFormTitle.textContent = 'Edit Status Update';
    this.statusUpdateForm.dataset.updateId = updateId;
    document.getElementById('submitStatusUpdateFormBtn').textContent = 'Save Changes';

    try {
        const response = await axios.get(`/api/projects/${projectId}`);
        const project = response.data;
        const update = project.updates.find(u => u.id == updateId); 
        if (update) {
            this.updateDisplayDateInput.value = update.update_display_date; 
            this.activityTaskInput.value = update.update_text;
            this.statusProgressTextInput.value = update.status_progress_text || '';
            this.updatedByInput.value = update.updated_by;
            this.statusColorRadios.forEach(radio => {
                if (radio.value === update.status_color) {
                    radio.checked = true;
                }
            });
        } else {
            this.showMessage('Status update not found for editing.', 'error');
            this.toggleModal('statusUpdateModal', false);
        }
    } catch (error) {
        console.error('Error fetching status update for edit:', error);
        this.showMessage('Failed to load status update for editing.', 'error');
        this.toggleModal('statusUpdateModal', false);
    }
  }

  async handleStatusUpdateSubmit(e) {
    e.preventDefault();
    const projectId = this.currentProjectId;
    const updateId = this.statusUpdateForm.dataset.updateId;
    const isEdit = updateId ? true : false;

    const selectedStatusColor = document.querySelector('input[name="statusColor"]:checked');

    if (!this.activityTaskInput.value.trim() || !this.updatedByInput.value.trim() || !selectedStatusColor || !this.updateDisplayDateInput.value) {
      this.showMessage('Please fill in all required fields (Date, Activity / Task, Status Color, Updated By).', 'error');
      return;
    }

    const updateData = {
      update_text: this.activityTaskInput.value.trim(),
      status_progress_text: this.statusProgressTextInput.value.trim(),
      status_color: selectedStatusColor.value,
      updated_by: this.updatedByInput.value.trim(),
      update_display_date: this.updateDisplayDateInput.value 
    };

    try {
      let response;
      if (isEdit) {
        updateData.admin_password = this.ADMIN_PASSWORD; 
        response = await axios.put(`/api/project_updates/${updateId}`, updateData);
        this.showMessage('Status update edited successfully!', 'success');
      } else {
        response = await axios.post(`/api/projects/${projectId}/updates`, updateData);
        this.showMessage('Status update added successfully!', 'success');
      }
      this.toggleModal('statusUpdateModal', false);
      this.showProjectDetails(projectId); 
    } catch (error) {
      console.error('Error saving status update:', error);
      this.showMessage('Failed to save status update. Check console for details.', 'error');
    }
  }

  async handleMarkProjectCompleted() {
    if (!this.currentProjectId) {
      this.showMessage('No project selected.', 'error');
      return;
    }

    if (!this.isAdmin) {
      this.showMessage('You need admin access to mark projects as completed.', 'error');
      return;
    }

    const password = prompt("Enter admin password to mark this project as completed:");
    if (password !== this.ADMIN_PASSWORD) {
      this.showMessage('Invalid admin password. Project not marked completed.', 'error');
      return;
    }

    try {
      await axios.put(`/api/admin/projects/${this.currentProjectId}/complete`, { admin_password: password });
      this.showMessage('Project marked as completed!', 'success');
      this.showProjectList(); 
    } catch (error) {
      console.error('Error marking project as completed:', error);
      this.showMessage('Failed to mark project as completed. Check console.', 'error');
    }
  }

  // --- Delete Project Functionality ---
  async deleteProject(projectId, adminPassword) {
    try {
      const response = await axios.delete(`/api/admin/projects/${projectId}`, { data: { admin_password: adminPassword } });
      const deletedProject = response.data.deleted_project;
      this.lastDeletedProjectData = deletedProject; 
      this.showMessage(`Project "${deletedProject.project_name}" deleted.`, 'success');
      this.showUndoBanner(deletedProject.project_name);
      this.fetchProjects(); 
    } catch (error) {
      console.error('Error deleting project:', error);
      this.showMessage('Failed to delete project. Check console.', 'error');
    }
  }

  async handleUndoDeletion() {
    if (this.lastDeletedProjectData) {
      try {
        const projectToRestore = { ...this.lastDeletedProjectData };
        delete projectToRestore.id;
        projectToRestore.project_stage = Array.isArray(projectToRestore.project_stage) ? projectToRestore.project_stage : (projectToRestore.project_stage ? projectToRestore.project_stage.split(',') : []);
        projectToRestore.project_scope = Array.isArray(projectToRestore.project_scope) ? projectToRestore.project_scope : (projectToRestore.project_scope ? projectToRestore.project_scope.split(',') : []);
        projectToRestore.admin_password = this.ADMIN_PASSWORD; 

        const response = await axios.post('/api/admin/projects', projectToRestore);

        if (this.lastDeletedProjectData.updates && this.lastDeletedProjectData.updates.length > 0) {
          for (const update of this.lastDeletedProjectData.updates) {
            const updateToRestore = { ...update };
            delete updateToRestore.id; 
            updateToRestore.project_id = response.data.id;
            delete updateToRestore.created_at; 

            await axios.post(`/api/projects/${response.data.id}/updates`, updateToRestore);
          }
        }

        this.showMessage(`"${this.lastDeletedProjectData.project_name}" restored!`, 'success');
        this.hideUndoBanner();
        this.fetchProjects(); 
      } catch (error) {
        console.error('Error undoing delete:', error);
        this.showMessage('Failed to undo deletion. Check console.', 'error');
      }
    }
  }
}

// Initialize the application
const app = new PESTimeline();
