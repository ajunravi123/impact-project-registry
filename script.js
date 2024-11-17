 const projects = ["Project A", "Project B", "Project C", "Project D", "Project E", "Project F"];
        let selectedProjects = new Set();
        let currentWeekIndex = 0; // Tracks the current set of weeks being shown
        const projectRows = document.getElementById("projectRows");
        const addProjectBtn = document.getElementById("addProjectBtn");
        const submitBtn = document.getElementById("submitBtn");
        const errorMessage = document.getElementById("errorMessage");
        const fridayHeader = document.getElementById("fridayHeader");

        // Generate Last 6 Fridays
        function generateFridays(count) {
            const fridays = [];
            const today = new Date();
            let current = new Date(today);

            // Set to most recent Friday
            current.setDate(today.getDate() - today.getDay() + 5); // Friday

            for (let i = 0; i < count; i++) {
                fridays.unshift(new Date(current)); // Insert at the beginning
                current.setDate(current.getDate() - 7); // Go back one week
            }

            return fridays;
        }

        // Format the date as "YYYY-MM-DD"
        function formatFridayHeader(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Month starts from 0
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        function updateDropdownOptions() {
            const dropdowns = document.querySelectorAll("select");
            dropdowns.forEach(dropdown => {
                const currentValue = dropdown.value;
                dropdown.innerHTML = ""; // Clear existing options
                const placeholderOption = document.createElement("option");
                placeholderOption.textContent = "Select a project";
                placeholderOption.disabled = true;
                placeholderOption.selected = currentValue === "";
                dropdown.appendChild(placeholderOption);

                projects.forEach(project => {
                    const option = document.createElement("option");
                    option.value = project;
                    option.textContent = project;
                    option.disabled = selectedProjects.has(project) && project !== currentValue;
                    if (project === currentValue) {
                        option.selected = true;
                    }
                    dropdown.appendChild(option);
                });
            });

            // Hide or show "Add New Project" button
            addProjectBtn.style.display = selectedProjects.size === projects.length ? "none" : "inline-block";
        }

        function addProjectRow(projectName = "", editable = true) {
            const row = document.createElement("tr");

            // Project Name
            const nameCell = document.createElement("td");
            if (editable) {
                const select = document.createElement("select");
                select.classList.add("form-control");
                select.addEventListener("change", (e) => {
                    const previousValue = e.target.getAttribute("data-previous-value");
                    if (previousValue) {
                        selectedProjects.delete(previousValue);
                    }
                    selectedProjects.add(e.target.value);
                    e.target.setAttribute("data-previous-value", e.target.value);
                    updateDropdownOptions();
                });

                select.setAttribute("data-previous-value", "");

                const placeholderOption = document.createElement("option");
                placeholderOption.textContent = "Select a project";
                placeholderOption.disabled = true;
                placeholderOption.selected = true;
                select.appendChild(placeholderOption);


                projects.forEach(project => {
                    const option = document.createElement("option");
                    option.value = project;
                    option.textContent = project;
                    option.disabled = selectedProjects.has(project);
                    select.appendChild(option);
                });

                nameCell.appendChild(select);
            } else {
                const nameInput = document.createElement("input");
                nameInput.type = "text";
                nameInput.value = projectName;
                nameInput.classList.add("form-control");
                nameInput.readOnly = true;
                nameCell.appendChild(nameInput);
            }
            row.appendChild(nameCell);

            // Friday Columns
            const fridays = generateFridays(6);
            fridays.forEach((friday, index) => {
                const cell = document.createElement("td");
                const input = document.createElement("input");
                input.type = "number";
                input.min = 0;
                input.max = 100;
                input.placeholder = "%";
                input.classList.add("form-control");
                input.readOnly = index < fridays.length - 1; // Past dates non-editable
                cell.appendChild(input);
                row.appendChild(cell);
            });

            


            // Add Delete Column
            const deleteCell = document.createElement("td");
            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-btn");
            deleteButton.innerHTML = '&times;';
            deleteButton.addEventListener("click", () => {
                const previousValue = row.querySelector("select").getAttribute("data-previous-value");
                if (previousValue) {
                    selectedProjects.delete(previousValue);
                }
                row.remove();
                updateDropdownOptions();
            });

            if(editable){
                deleteCell.appendChild(deleteButton);
            }

            row.appendChild(deleteCell);

            projectRows.appendChild(row);
        }

        function validateTotals() {
            errorMessage.style.display = "none";
            const rows = projectRows.querySelectorAll("tr");
            const lastFridayIndex = 5; // Last week's column (6th column)

            let total = 0;

            // Loop through each row and sum the values of the last Friday column
            rows.forEach(row => {
                const inputs = row.querySelectorAll("td:nth-child(n+2) input");
                const lastFridayInput = inputs[lastFridayIndex];

                if (lastFridayInput && lastFridayInput.value) {
                    total += parseInt(lastFridayInput.value);
                }
            });

            // If the total is not 100, show error
            if (total !== 100) {
                // errorMessage.style.display = "block";
                showModal()
            } else {
                showSuccessModal()
                // alert("Data submitted successfully!");
            }
        }

        addProjectBtn.addEventListener("click", () => {
            addProjectRow();
            // updateDropdownOptions();
        });

        submitBtn.addEventListener("click", validateTotals);

        // Back Arrow Click
        // document.getElementById("backWeeksBtn").addEventListener("click", () => {
        //     currentWeekIndex = (currentWeekIndex + 1) % 2;
        //     updateTableHeaders();
        // });

        function updateTableHeaders() {
            // Clear previous headers
            // fridayHeader.innerHTML = "<th><span class='back-arrow' id='backWeeksBtn'>&#8592;</span> Project Name</th>";
            fridayHeader.innerHTML = '<th style="width:24%">Project Name</th>';
            const fridays = generateFridays(6);
            fridays.forEach(friday => {
                const th = document.createElement("th");
                th.textContent = getWeekNumberInMonth(formatFridayHeader(friday));

                const dt = document.createElement("div");
                dt.classList.add("readable_date");
                dt.textContent = subtractDays(formatFridayHeader(friday), 4)

                th.appendChild(dt)

                fridayHeader.appendChild(th);

                
            });

            const lastone = document.createElement("th");
            lastone.textContent = "Action";
            fridayHeader.appendChild(lastone);

            updateDropdownOptions();
        }

        // Initial Rows
        updateTableHeaders();
        ["Project A", "Project B", "Project C"].forEach(project => {
            selectedProjects.add(project);
            addProjectRow(project, false);
        });

        function getWeekNumberInMonth(date) {
            const inputDate = new Date(date);  // Convert input to Date object
            const firstDayOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);  // First day of the month

            // Get the difference in days between the given date and the first day of the month
            const dayOfMonth = inputDate.getDate();

            // Calculate the week number (rounding up since we want to count partial weeks)
            const weekNumber = Math.ceil(dayOfMonth / 7);

            // Get the formatted date "DD-MM-YYYY"
            const formattedDate = `${String(inputDate.getDate()).padStart(2, '0')}-${String(inputDate.getMonth() + 1).padStart(2, '0')}-${inputDate.getFullYear()}`;

            // Get the suffix for the week number (1st, 2nd, 3rd, 4th, etc.)
            const weekSuffix = getWeekSuffix(weekNumber);

            // Get the month name (e.g., "Nov")
            const monthName = inputDate.toLocaleString('en-us', { month: 'short' });

            // Return the formatted string
            // return `${monthName} ${weekNumber}${weekSuffix} week (${formattedDate})`;
            return `${monthName} ${weekNumber}${weekSuffix} week`;
        }

        // Function to return the appropriate suffix for the week number
        function getWeekSuffix(weekNumber) {
            if (weekNumber === 1) return 'st';
            if (weekNumber === 2) return 'nd';
            if (weekNumber === 3) return 'rd';
            return 'th';  // Default to 'th'
        }

        function subtractDays(dateString, daysToSubtract) {
            // Parse the input date string into a Date object
            const date = new Date(dateString);
            
            // Subtract the specified number of days
            date.setDate(date.getDate() - daysToSubtract);
            
            // Format the result as "YYYY-MM-DD"
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const year = date.getFullYear();
            
            return `${year}-${month}-${day}`;
        }




        function showModal() {
            const modal = document.getElementById("modal");
            modal.style.display = "block"; // Show the modal
        }

        function hideModal() {
            const modal = document.getElementById("modal");
            modal.style.display = "none"; // Hide the modal
        }

        function showSuccessModal() {
            const modal2 = document.getElementById("modal2");
            modal2.style.display = "block"; // Show the modal
        }

        function hideSuccessModal() {
            const modal2 = document.getElementById("modal2");
            modal2.style.display = "none"; // Hide the modal
        }