// Add loading state utilities
const showLoading = () => document.getElementById('loading-overlay').style.display = 'flex';
const hideLoading = () => document.getElementById('loading-overlay').style.display = 'none';
const showError = (message) => alert(message);

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const uploadArea = document.querySelector('.upload-area');
    const resumeInput = document.getElementById('resume');
    const roleSelect = document.getElementById('roleSelect');
    const roleFilter = document.getElementById('roleFilter');
    const candidatesList = document.getElementById('candidates-list');

    // Handle file selection
    if (resumeInput) {
        resumeInput.addEventListener('change', (e) => {
            const fileName = e.target.files[0]?.name || '';
            const fileDisplay = document.querySelector('.selected-file');
            if (fileDisplay) fileDisplay.textContent = fileName;
        });
    }

    // Handle file drop
    if (uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        uploadArea.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file && resumeInput) {
                const dT = new DataTransfer();
                dT.items.add(file);
                resumeInput.files = dT.files;
                document.querySelector('.selected-file').textContent = file.name;
            }
        });

        // Make upload area clickable
        uploadArea.addEventListener('click', () => resumeInput?.click());
    }

    // Handle form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoading();

            try {
                const formData = new FormData(uploadForm);
                
                // Handle custom role
                if (formData.get('role') === 'custom') {
                    const customRole = formData.get('customRole');
                    if (customRole) {
                        formData.set('role', customRole);
                    }
                }
                formData.delete('customRole');

                const response = await fetch('http://127.0.0.1:5000/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                // Show results
                const resultContainer = document.getElementById('result-container');
                if (resultContainer) {
                    resultContainer.style.display = 'block';
                    document.getElementById('candidate-name').textContent = data.name;
                    document.getElementById('candidate-email').textContent = data.email;
                    document.getElementById('match-score').textContent = data.match_score;
                    
                    const keywordsContainer = document.getElementById('matched-keywords');
                    if (keywordsContainer) {
                        keywordsContainer.innerHTML = data.matched_keywords
                            .map(keyword => `<span class="skill-tag">${keyword}</span>`)
                            .join('');
                    }
                }

                // Clear form
                uploadForm.reset();
                document.querySelector('.selected-file').textContent = '';

                // Refresh candidates list
                await fetchCandidates();

            } catch (error) {
                console.error('Error:', error);
                showError(error.message || 'An error occurred while processing your request.');
            } finally {
                hideLoading();
            }
        });
    }

    // Handle role select
    if (roleSelect) {
        roleSelect.addEventListener('change', function() {
            const customRoleDiv = document.getElementById('customRoleDiv');
            const customRoleInput = document.getElementById('customRole');
            
            if (customRoleDiv && customRoleInput) {
                if (this.value === 'custom') {
                    customRoleDiv.style.display = 'block';
                    customRoleInput.required = true;
                } else {
                    customRoleDiv.style.display = 'none';
                    customRoleInput.required = false;
                }
            }
        });
    }

    // Handle role filtering
    if (roleFilter) {
        roleFilter.addEventListener('input', debounce((e) => {
            fetchCandidates(e.target.value);
        }, 300));
    }

    // Initial load of candidates
    fetchCandidates();
});

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Function to fetch and display candidates
async function fetchCandidates(roleFilter = '') {
    showLoading();
    const candidatesList = document.getElementById('candidates-list');
    
    try {
        const response = await fetch('http://127.0.0.1:5000/candidates/filter');
        if (!response.ok) throw new Error('Failed to fetch candidates');
        
        const candidates = await response.json();
        
        if (!candidatesList) return;

        const filteredCandidates = roleFilter
            ? candidates.filter(c => c.role && c.role.toLowerCase().includes(roleFilter.toLowerCase()))
            : candidates;

        if (filteredCandidates.length === 0) {
            candidatesList.innerHTML = `
                <div class="alert alert-info">No candidates found</div>
            `;
            return;
        }

        candidatesList.innerHTML = filteredCandidates.map(candidate => `
            <div class="candidate-card">
                <div class="candidate-header">
                    <h3>${candidate.name || 'N/A'}</h3>
                    <button onclick="deleteCandidate(${candidate.id})" class="btn btn-danger btn-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="candidate-body">
                    <p><i class="fas fa-envelope"></i> ${candidate.email || 'N/A'}</p>
                    <p><i class="fas fa-user-tie"></i> ${candidate.role || 'N/A'}</p>
                    <p><i class="fas fa-star"></i> Match Score: ${candidate.match_score || '0'}</p>
                    <div class="skills">
                        <p><i class="fas fa-code"></i> Skills:</p>
                        <div class="skills-tags">
                            ${(candidate.skills || '').split(',')
                                .filter(skill => skill.trim())
                                .map(skill => `<span class="skill-tag">${skill.trim()}</span>`)
                                .join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        if (candidatesList) {
            candidatesList.innerHTML = `
                <div class="alert alert-danger">
                    Failed to load candidates. Please try again later.
                </div>
            `;
        }
    } finally {
        hideLoading();
    }
}

// Function to delete candidate
async function deleteCandidate(id) {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    
    showLoading();
    try {
        const response = await fetch(`http://127.0.0.1:5000/candidates/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Failed to delete candidate');
        
        await fetchCandidates(document.getElementById('roleFilter')?.value || '');
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to delete candidate');
    } finally {
        hideLoading();
    }
}
