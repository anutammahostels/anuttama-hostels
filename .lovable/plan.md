

## Plan: Delete 10 Unwanted Properties

### Properties to Keep
| Name | ID |
|---|---|
| Anuttama | `f95d011a-0699-4fd8-85aa-560c03d3db4d` |
| Demo 2 | `1c946068-e780-4ae0-896d-bd7f0cadff70` |

### Properties to Delete (10)
Anuttama (2 duplicates), Agtg, anamol watika residency, Demo1, Kanta girls hostel, lklk (×2), Prabhu ji, prabhu ji residency

### Dependent Data to Clean First
| Table | Records to Delete |
|---|---|
| maintenance_tickets | 3 |
| policy_settings | 56 |
| blocks (+ floors, rooms, beds) | 2 blocks + child records |

### Execution Order (1 migration)
1. Delete beds → rooms → floors → blocks for those properties
2. Delete maintenance_tickets, policy_settings for those properties
3. Delete the 10 properties themselves

All via a single migration using `DELETE ... WHERE property_id NOT IN (keep_id_1, keep_id_2)`.

### Files Changed
- **1 migration** — cascading deletes of dependent data then properties

