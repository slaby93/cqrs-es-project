# cqrs-es-project

## Overview
Client have two avilable commands
Add user X to group
Remove user X from group

```bash
http POST :9001/group/<group_id>/<user_id>
http DELETE :9001/group/<group_id>/<user_id>
```