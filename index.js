$(document).ready(function () {

    class TableData {
        constructor(firstName, lastName, age, score, id) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.age = age;
            this.score = score;
            this.id = id;
        }

        getBackgroundColor() {
            return getBackgroundColor(this.score);
        }
    }

    const tableLoader = $('#tableLoader')[0];
    const limit = 3;
    let totalCount = 0;
    let currentPage = 1;
    let tableData = [];
    let currentEditId;
    let currentSortBy;

    setInterval(fetchDataFromServer(1), 100000);

    function sendTableDataToServer(data) {
        const loader = createTableLoader();
        $('#submit').prop('disabled', true);

        fetch('http://localhost:3000/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                stopTableLoader(loader);
                $('#submit').prop('disabled', false);
                if (response.ok) {
                    fetchDataFromServer(currentPage);
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                stopTableLoader(loader);
                $('#submit').prop('disabled', false);
                console.error('There was a problem with your fetch operation:', error);
            });
    }

    function fetchDataFromServer(page, sortBy = '') {
        const loader = createTableLoader();
        $('#submit').prop('disabled', true);
        let url = `http://localhost:3000/data?page=${page}&limit=${limit}`;
        if (sortBy) {
            url += `&sortBy=${sortBy}`;
            currentSortBy = sortBy;
        } else if (currentSortBy) {
            url += `&sortBy=${currentSortBy}`;  // Use current sorting criteria if available
        }

        fetch(url)
            .then(response => {
                stopTableLoader(loader);
                $('#submit').prop('disabled', false);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(response => {
                $('#table tr:gt(0)').remove();
                tableData = [];
                totalCount = response.totalCount;

                response.data.forEach(item => {
                    const data = new TableData(item.firstName, item.lastName, item.age, item.score, item.id);
                    tableData.push(data);
                });
                displayTable();
                updatePaginationControls(page);
            })
            .catch(error => {
                stopTableLoader(loader);
                $('#submit').prop('disabled', false);
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    function updatePaginationControls(page) {
        currentPage = page;
        $('#pageInput').val(currentPage);
        $('#totalPages').text(Math.ceil(totalCount / limit));
        $('#prevPage').prop('disabled', currentPage === 1);
        $('#nextPage').prop('disabled', currentPage * limit >= totalCount);
    }

    function deleteSpecificDataFromServer(id) {
        const loader = createTableLoader();
        $('#submit').prop('disabled', true);

        fetch(`http://localhost:3000/data/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(response => {
                stopTableLoader(loader);
                $('#submit').prop('disabled', false);
                if (response.ok) {
                    tableData = tableData.filter(item => item.id !== id);
                    displayTable();
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                stopTableLoader(loader)
                $('#submit').prop('disabled', false);
                console.error('Error:', error);
            });
    }

    function deleteDataFromServer() {
        const loader = createTableLoader();
        $('#submit').prop('disabled', true);

        fetch('http://localhost:3000/data', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                stopTableLoader(loader);
                $('#submit').prop('disabled', false);
                if (response.ok) {
                    $('#table tr:gt(0)').remove();
                    tableData = [];
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                stopTableLoader(loader);
                $('#submit').prop('disabled', false);
                console.error('There was a problem with your fetch operation:', error);
            });
    }

    function updateData(data, id) {
        const loader = createTableLoader();
        $('#submit').prop('disabled', true);

        fetch(`http://localhost:3000/data/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                stopTableLoader(loader);
                $('#submit').prop('disabled', false);
                if (response.ok) {
                    fetchDataFromServer(currentPage);
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                stopTableLoader(loader);
                $('#submit').prop('disabled', false);
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    function validateInput(firstName, lastName, age, score) {
        const validAge = !isNaN(parseFloat(age)) && age >= 18 && age <= 150;
        const validScore = !isNaN(parseFloat(score)) && score > 0 && score <= 100;

        return (firstName !== '' && lastName !== '' && validAge && validScore);
    }

    function createTableLoader() {
        $('#table tr:gt(0)').remove();
        $('.btn-container').addClass('hidden');
        $('.pagination').addClass('hidden');
        $('.table-loader-container').css('margin-top', '200px');
        return new Spinner().spin(tableLoader);
    }

    function stopTableLoader(loader) {
        loader.stop();
        $('.btn-container').removeClass('hidden');
        $('.pagination').removeClass('hidden');
        $('.table-loader-container').css('margin-top', '0px');
    }

    function displayTable() {
        $('#table tr:gt(0)').remove();
        tableData.forEach(item => {
            const newRow = `
        <tr style="background: ${item.getBackgroundColor()}">
            <td>${item.firstName}</td>
            <td>${item.lastName}</td>
            <td>${item.age}</td>
            <td>${item.score}</td>
            <td><i data-entry-id=${item.id} class="fa-solid fa-pencil" style="cursor: pointer;"></i></td>
            <td><i data-entry-id=${item.id} class="fas fa-times" style="cursor: pointer;"></i></td>
        </tr>
        `;
            $('#table').append(newRow);
        });
    }

    function getBackgroundColor(score) {
        const hue = Math.round((score / 100) * 120);
        const hue2 = (hue + 60) % 360;

        return `linear-gradient(to right, hsl(${hue}, 100%, 50%), hsl(${hue2}, 100%, 50%))`;
    }

    $('#form').submit(function (event) {
        event.preventDefault(); // Prevent the form from submitting in the traditional way

        const firstName = $('#firstName').val();
        const lastName = $('#lastName').val();
        const age = $('#age').val();
        const score = $('#score').val();

        if (validateInput(firstName, lastName, age, score)) {
            sendTableDataToServer(new TableData(firstName, lastName, age, score));
            $('#form')[0].reset();
            $('#submit').prop('disabled', true);
        } else {
            alert("Minimum age is 18. Score is between 1 and 100.");
        }
    });

    $('#table').on('click', '.fa-times', function () {
        const id = $(this).data('entry-id');
        deleteSpecificDataFromServer(id);
    });

    $('#table').on('click', '.fa-pencil', function () {
        currentEditId = $(this).data('entry-id');
        $('#editForm').removeClass('hidden');
        $('#overlay').removeClass('hidden');
        $('#editForm').addClass('editFormPossition');
    });

    $('#editForm').submit(function (event) {
        const currentData = tableData.find(data => data.id === currentEditId);

        event.preventDefault();
        $('#editForm').addClass('hidden');
        $('#overlay').addClass('hidden');
        $('#editForm').removeClass('editFormPossition');

        let firstName = $('#editFirstName').val();
        let lastName = $('#editLastName').val();
        let age = $('#editAge').val();
        let score = $('#editScore').val();

        if (firstName == '' && lastName == '' && age == '' && score == '') {
            return;
        }

        firstName = firstName !== '' ? firstName : currentData.firstName;
        lastName = lastName !== '' ? lastName : currentData.lastName;
        age = age !== '' ? age : currentData.age;
        score = score !== '' ? score : currentData.score;

        if (!validateInput(firstName, lastName, age, score)) {
            alert("Minimum age is 18. Score is between 1 and 100.");
            $('#editForm')[0].reset();
            return;
        }

        const editData = new TableData(firstName, lastName, age, score);
        $('#editForm')[0].reset();
        updateData(editData, currentEditId);
    });

    $('#editCancel').click(function (event) {
        event.preventDefault();
        $('#editForm').addClass('hidden');
        $('#overlay').addClass('hidden');
        $('#editForm').removeClass('editFormPossition');
    });

    $('#goToPage').on('click', function() {
        let page = parseInt($('#pageInput').val());
        if (page >= 1 && page <= Math.ceil(totalCount / limit)) {
            fetchDataFromServer(page, currentSortBy);
        } else {
            alert(`Please enter a page number between 1 and ${Math.ceil(totalCount / limit)}.`);
        }
    });

    $('#pageInput').keypress(function (e) {
        if (e.which === 13) {  // Enter key pressed
            $('#goToPage').click();
        }
    });

    $('#prevPage').click(function () {
        fetchDataFromServer(currentPage - 1);
    });

    $('#nextPage').click(function () {
        fetchDataFromServer(currentPage + 1);
    });

    $('#loadTable').click(function () {
        currentSortBy = '';
        fetchDataFromServer(1);
    });

    $('#clearTable').click(function () {
        deleteDataFromServer();
    });

    $('#sortByAge').click(function () {
        fetchDataFromServer(1, 'age');
    });

    $('#sortByScore').click(function () {
        fetchDataFromServer(1, 'score');
    });
});