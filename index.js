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

    let tableData = [];

    setInterval(updateTableDataFromServer, 10000);

    function sendTableDataToServer(data) {
        fetch('http://localhost:3000/data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    updateTableDataFromServer();
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
    }

    function updateTableDataFromServer() {
        $('#table tr:gt(0)').remove();
        tableData = [];

        fetch('http://localhost:3000/data')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                $('#table tr:gt(0)').remove();
                data.forEach(item => {
                    const data = new TableData(item.firstName, item.lastName, item.age, item.score, item.id);
                    tableData.push(data);
                });
                displayTable();
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    function deleteSpecificDataFromServer(id) {
        fetch(`http://localhost:3000/data/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        })
            .then(response => {
                if (response.ok) {
                    tableData = tableData.filter(item => item.id !== id);
                    displayTable();
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function deleteDataFromServer() {
        fetch('http://localhost:3000/data', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    $('#table tr:gt(0)').remove();
                    tableData = [];
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                console.error('There was a problem with your fetch operation:', error);
            });
    }

    function fetchSortedData(sortBy) {
        fetch(`http://localhost:3000/data?sortBy=${sortBy}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                tableData = [];
                data.forEach(item => {
                    const data = new TableData(item.firstName, item.lastName, item.age, item.score, item.id);
                    tableData.push(data);
                });
                displayTable();
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    function validateInput(firstName, lastName, age, score) {
        const validAge = !isNaN(parseFloat(age)) && age >= 18 && age <= 150;
        const validScore = !isNaN(parseFloat(score)) && score > 0 && score <= 100;

        return (firstName !== '' && lastName !== '' && validAge && validScore);
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

    // Submit data
    $('#form').submit(function (event) {
        event.preventDefault(); // Prevent the form from submitting in the traditional way

        const firstName = $('#firstName').val();
        const lastName = $('#lastName').val();
        const age = $('#age').val();
        const score = $('#score').val();

        if (validateInput(firstName, lastName, age, score)) {
            sendTableDataToServer(new TableData(firstName, lastName, age, score));
            $('#form')[0].reset(); // Clear the form inputs after submission
        } else {
            alert("Minimum age is 18. Score is between 1 and 100.");
        }
    });

    // Delete single entry
    $('#table').on('click', '.fa-times', function () {
        const id = $(this).data('entry-id');
        deleteSpecificDataFromServer(id);
    });

    // Clear table
    $('#clearTable').click(function () {
        deleteDataFromServer();
    });

    // Sort table by age
    $('#sortByAge').click(function () {
        fetchSortedData('age');
    });

    // Sort table by score
    $('#sortByScore').click(function () {
        fetchSortedData('score');
    });
});