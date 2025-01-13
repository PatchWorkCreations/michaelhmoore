async function createOrderCallback() {
    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cart: [
                    {
                        id: "sailors-compass",
                        name: "The Sailor’s Compass",
                        quantity: 2,
                        price: 28.74,
                    },
                ],
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orderData = await response.json();

        if (orderData.id) {
            return orderData.id; // Return the PayPal order ID
        } else {
            const errorDetail = orderData?.details?.[0];
            const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                : JSON.stringify(orderData);

            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error(error);
        alert(`Could not initiate PayPal Checkout: ${error.message}`);
    }
}

async function onApproveCallback(data) {
    try {
        const response = await fetch(`/api/orders/${data.orderID}/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const orderData = await response.json();

        const transaction = orderData?.purchase_units?.[0]?.payments?.captures?.[0];
        if (transaction && transaction.status === "COMPLETED") {
            alert(`Thank you for purchasing "The Sailor’s Compass"! Your Transaction ID: ${transaction.id}`);
            // Close the modal
            document.getElementById("buyModal").classList.remove("show");
        } else {
            throw new Error("Transaction could not be completed.");
        }
    } catch (error) {
        console.error(error);
        alert(`Transaction failed: ${error.message}`);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Render PayPal buttons
    paypal.Buttons({
        createOrder: createOrderCallback, // Reuse the createOrderCallback
        onApprove: onApproveCallback,
        onCancel: function () {
            alert("You canceled the PayPal payment.");
        },
    }).render("#paypal-button-container");
});

document.addEventListener("DOMContentLoaded", function () {
    // Render PayPal buttons
    paypal.Buttons({
        createOrder: function (data, actions) {
            // Collect user input from the form
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const address = document.getElementById("address").value;
            const quantity = document.getElementById("quantity").value;

            // Ensure required fields are filled
            if (!name || !email || !address || !quantity) {
                alert("Please fill in all required fields.");
                return;
            }

            // Call backend to create the order
            return fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    customer: {
                        name: name,
                        email: email,
                        address: address,
                    },
                    cart: [
                        {
                            id: "sailors-compass",
                            name: "The Sailor’s Compass",
                            quantity: parseInt(quantity, 10),
                            price: 28.74,
                        },
                    ],
                }),
            })
                .then(response => response.json())
                .then(orderData => orderData.id); // Use the order ID from your backend
        },
        onApprove: function (data, actions) {
            // Capture the order
            return fetch(`/api/orders/${data.orderID}/capture`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then(response => response.json())
                .then(orderData => {
                    const transaction =
                        orderData?.purchase_units?.[0]?.payments?.captures?.[0];
                    if (transaction && transaction.status === "COMPLETED") {
                        alert(`Thank you for purchasing "The Sailor’s Compass"! Your Transaction ID: ${transaction.id}`);
                        // Close the modal
                        document.getElementById("buyModal").classList.remove("show");
                    } else {
                        throw new Error("Transaction could not be completed.");
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert("There was an issue with your payment. Please try again.");
                });
        },
        onCancel: function () {
            alert("You canceled the PayPal payment.");
        },
    }).render("#paypal-button-container");
});
