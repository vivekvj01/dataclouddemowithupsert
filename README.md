# Data Cloud Demo App

This is a simple web application that demonstrates how to connect to Salesforce Data Cloud from a Heroku application using AppLink. The application allows you to search for guest bookings by name.

## Prerequisites

*   A Heroku account
*   The Heroku CLI installed
*   A Salesforce Data Cloud instance with the necessary data models (`Reservation__dlm` and `ssot__Individual__dlm`)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd DataCloud-DemoAppDisplaybookings
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Running Locally

To run the application locally, you'll need to set up a `.env` file to store your Salesforce credentials.

1.  **Create a `.env` file in the root of the project.** Add the following content, replacing the placeholder values with your actual Data Cloud credentials:

    ```
    SF_LOGIN_URL=https://login.salesforce.com
    SF_USERNAME=your-username@example.com
    SF_PASSWORD=your-password
    SF_CLIENT_ID=your-connected-app-client-id
    SF_CLIENT_SECRET=your-connected-app-client-secret
    ```

    **Note:** For security reasons, never commit the `.env` file to version control.

2.  **Start the application:**

    ```bash
    npm start
    ```

    The application will be available at `http://localhost:3000`.

## Deploying to Heroku

1.  **Create a new Heroku app:**

    ```bash
    heroku create
    ```

2.  **Provision the AppLink for Data Cloud add-on:**

    ```bash
    heroku addons:create applink:datacloud
    ```

3.  **Deploy the application:**

    ```bash
    git push heroku main
    ```

4.  **Open the application in your browser:**

    ```bash
    heroku open
    ```

## How It Works

*   The backend is a Node.js Express server that handles API requests.
*   The `@salesforce/datacloud-sdk-js` is used to connect to and query Salesforce Data Cloud.
*   The frontend is a simple HTML, CSS, and JavaScript application that allows users to enter a guest name and view the results.

## Testing

To test the application, enter `Sofia Rodriguez` in the guest name field and click "Search." You should see at least one booking in the response. 