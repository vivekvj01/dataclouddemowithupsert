# Heroku AppLink DataCloud Bookings Demo

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy?template=https://github.com/heroku/DataCloud-DemoDisplayBookings)

This is a sample Heroku web application that connects to Salesforce Data Cloud to display booking information for a specified guest. It uses Heroku AppLink for secure authentication and connection. 

After deploying the application using the button, you must authorize it to connect to your Salesforce Data Cloud organization.

## Post-Deployment Configuration

After deploying the application, follow these steps to configure it.

1.  **Install the Heroku AppLink CLI plugin:**
    ```sh
    heroku plugins:install @heroku-cli/plugin-applink
    ```

2.  **Set the Data Cloud Org Developer Name:**
    If you didn't set this during the "Deploy to Heroku" button setup, you can set it manually. Replace `<your-app-name>` with the name of your Heroku app and `<DEVELOPER_NAME>` with the Developer Name of your Data Cloud org.
    ```sh
    heroku config:set DATA_CLOUD_ORG_DEVELOPER_NAME=<DEVELOPER_NAME> --app <your-app-name>
    ```

3.  **Authorize the AppLink connection:**
    Run the following command, replacing `<your-app-name>` and `<DEVELOPER_NAME>` with your specific values.

    ```sh
    heroku datacloud:authorizations:add --app <your-app-name> <DEVELOPER_NAME>
    ```

    This command will initiate a browser-based login to your Salesforce org to grant the necessary permissions.

Once authorized, your application will be able to query Data Cloud. 