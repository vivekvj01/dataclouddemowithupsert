# Heroku AppLink DataCloud Bookings Demo

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy?template=https://github.com/heroku/DataCloud-DemoDisplayBookings)

This is a sample Heroku web application that connects to Salesforce Data Cloud to display booking information for a specified guest. It uses Heroku AppLink for secure authentication and connection. 

After deploying the application using the button, you must authorize it to connect to your Salesforce Data Cloud organization.

1.  **Install the Heroku AppLink CLI plugin:**
    ```sh
    heroku plugins:install @heroku-cli/plugin-applink
    ```

2.  **Authorize the AppLink connection:**
    Run the following command, replacing `<your-app-name>` with the name of your Heroku app and `<DEVELOPER_NAME>` with the same value you provided for the `DATA_CLOUD_ORG_DEVELOPER_NAME` environment variable during setup.

    ```sh
    heroku datacloud:authorizations:add --app <your-app-name> <DEVELOPER_NAME>
    ```

    This command will initiate a browser-based login to your Salesforce org to grant the necessary permissions.

Once authorized, your application will be able to query Data Cloud. 