# Heroku AppLink DataCloud Bookings Demo

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy?template=https://github.com/heroku/DataCloud-DemoDisplayBookings)

This is a sample Heroku web application that connects to Salesforce Data Cloud to display booking information for a specified guest. It uses Heroku AppLink for secure authentication and connection. 

After deploying the application using the button, you must authorize it to connect to your Salesforce Data Cloud organization.

1.  **Install the Heroku AppLink CLI plugin:**
    ```sh
    heroku plugins:install @heroku-cli/plugin-applink
    ```

2.  **Authorize the AppLink connection:** 