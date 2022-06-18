## **[GET]** /api/packages 
List all packages.

| Responses | Status Code | Type | 
| - | - | - |
| Array of Package Objects. | **200** | application/json |

| Param | Location | Type | Required | Default | Valid |
| - | - | - | - | - | - |
| page | query | integer | 'TRUE' | 1 | |
| sort | query | string | 'TRUE' | | "downloads","created_at","updated_at","stars" |
| direction | query | string | 'TRUE' | | "asc","desc" |

