(define (problem logistics-1)
(:domain logistics-strips)
(:objects airplane1 airplane2 location2 location3 location1 location4 city2 city1 truck2 truck1 package1 )
(:init (is-package package1)(is-truck truck1) (is-truck truck2) 
(is-location city1) (is-location city2) 
(is-location location1) (is-location location2) (is-location location3) (is-location location4) 
(is-hub location1)(is-hub location3) 
(is-airplane airplane1)(is-airplane airplane2) 
(in airplane1 location3) (in airplane2 location1) (in truck1 location4) (in truck2 location1) (in package1 location3)
(in location2 city1) (in location1 city1) (in location3 city2) (in location4 city2))
(:goal (and (in package1 location2)))
)