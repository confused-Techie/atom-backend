This document aims to make the database schema public for developers.

The database itself is hosted on Digital Ocean, and the current schema is as below.

Database: 'pulsar-packages'

Tables:

## pointers 

| 'name' (datatype: text) | 'pointer' (datatype: uuid) |
| --- | --- |
| -vimes45-syntax | 1210236a-e1fd-4c7b-b096-e88ef68934c4 |
| 05-kiom-makehtml | cc952d60-a900-47ca-9aed-52513f0deadc |
| 1337-theme | e06f14be-8696-4714-b696-a43d2816c271 | 
| 1989-syntax | 3dfa3927-7871-4a6f-b9c5-8556e3f849fc |

## packages 

| 'pointer' (datatype: uuid) | 'data' (datatype: jsonb) |
| --- | --- |
| 2672c3a9-2f35-4554-b046-c2b1e83d45cb | ..... |

The 'data' field of the packages table, is truly just the JSON data, shoved in. While this is not the plan forever, and may not be best practice, it seems functional enough for the time being. Until after we have a functional application, at which time we will do our best to get this updated taking proper advantage of the database.
