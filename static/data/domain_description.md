For the purpose of this study, we are going to use package transportation (logistics) as an example planning problem. 

In this kind of problem, we want to transport a package from one location to another, using a combination of air and road transportation. The domain is described as follows:
- There are multiple **Cities**, each with multiple **Locations** inside them. Cities are locations as well. 

- **Trucks** are ground based transportation, that can move between locations within a city, but they cannot move between cities.

    This is encoded in the "move-truck" action, which takes 4 parameters as shown:
    - Action "move-truck( `truck`, `source location`, `destination location`, `city` )"
    
    With the Preconditions:
    - `truck` should be a truck, `source location`, `destination location` and `city` should be valid locations and `city` should be a city
    - `truck` should be in `source location`
    - Both `source location` and `destination location` should be in `city`
    If the preconditions are satisfied (i.e., are *True* when the action is taken), the truck `truck` is moved to the destination location after this action is performed.

- **Airplanes** are air based transportation that can move across **cities**. Each city has a location which is also an **airport**, and **airplanes** can only move between these **airports**. 

	This is encoded in the "move-airplane" action, which takes 3 parameters as shown:
	- Action "move-airplane( `airplane`, `source location`, `destination location` )"

    With the Preconditions:
	- `airplane` is an airplane, and `source location` and `destination location` are locations
	- `source location` and `destination location` are also airports
	
    If the preconditions are satisfied, the airplane is moved to the destination airport after this action is performed

- **Packages** are objects that can be "loaded" onto trucks and airplanes and then moved to different locations.
	We can **Load** packages into trucks ("load-truck") and airplanes ("load-airplane") if they are in the same location, and after moving the trucks and airplanes, **Unload** the packages at the destination ("unload-truck" and "unload-airplane"). 
    
    Each of these actions takes the `package`, the vehicle (`truck` or `airplane`), and the `location` where the package needs to be loaded or unloaded from the vehicle, and it is a precondition that the package and vehicle must both be in the location specified for the action to take place.

All 6 available actions and the input parameters are shown in the table below.
| Action     | Parameters                                         |
|------------|----------------------------------------------------|
| load-truck    | package, truck, location                            |
| move-truck    | truck, source location, destination location, city |
| unload-truck    | package, truck, location                            |
| load-airplane | package, airplane, location                         |
| move-airplane | airplane, source location, destination location    |
| unload-airplane | package, airplane, location                         |


A typical planning problem for logistics needs to use these actions to go from a **start state** to a **goal state**. The start state represents the configuration of the locations and cities, in addition to specifying the number of trucks, airplanes and packages and their locations. The goal is to transport all packages from their initial state to their goal state.

Mini-quiz: 
Q1. Being able to understand predicates is neceessary for understanding planning. What does `is-airplane(airplane1)` mean? 
1. airplane is an airplane1
2. airplane1 is an airplane
3. airplane1 is in city1
4. airplane1 is not an airplane
(hint: the answer is #2)

Q2. What does `in(package1, location1)` mean?
1. location1 is in package1
2. location1 and package1 are in a city
3. package1 is in location1
4. package1 is not in location1
(hint: the answer is #3)

## Problem
Below, you are given the description for a logistics problem that uses this domain, and you will be asked to create a plan using the actions described above to transport an package to the goal.

### Start state:
2 cities: `city1`, `city2`
4 locations: `location1`, `location2`, `location3`, `location4`
- `location1`, `location2` are in `city1`
- `location3`, `location4` are in `city2`
- `location1`, `location3` are airports

2 airplanes: `airplane1`, `airplane2`
- `airplane1` is in `location3`
- `airplane2` is in `location1`

2 trucks: `truck1`, `truck2`
- `truck1` is in `location4`
- `truck2` is in `location1`

1 package: `package1`
- `package1` is in `location3`

### Goal:
Send `package1` to `location2`