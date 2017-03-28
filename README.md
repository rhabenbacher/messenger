# messenger
### ServiceNow feed messages in a native mobile app


This app is built with react native.
It lets the user display and add messages to the ServiceNow Feed


## Requirements to run this app

### ServiceNow instance
You need a running ServiceNow instance. A personal developer instance can be obtained for free at [developer.servicenow.com](https://developer.servicenow.com).

### src/config.js
You have to edit this file before running the app.
    
    #Enter the url of your server
    export const urlMessages = YourServer + '/api/now/table/live_message';
    
    
    #default in config.js
    #This query shows 24 feed messages that belong to a message group starting with a '!' in descending order (newest first)  
    export const messageQueryParams = "?sysparm_query=groupSTARTSWITH!%5EORDERBYDESCsys_created_on&sysparm_display_value=all&sysparm_fields=sys_id%2Cmessage%2Cgroup%2Cprofile%2Creply_to%2Csys_created_on%2Csys_created_by&sysparm_limit=24";
    
    #Adapt it e.g to this query:
    #This query shows 24 feed messages in descending order (newest first)  
    export const messageQueryParams = "?sysparm_query=%5EORDERBYDESCsys_created_on&sysparm_display_value=all&sysparm_fields=sys_id%2Cmessage%2Cgroup%2Cprofile%2Creply_to%2Csys_created_on%2Csys_created_by&sysparm_limit=24";
    
   

