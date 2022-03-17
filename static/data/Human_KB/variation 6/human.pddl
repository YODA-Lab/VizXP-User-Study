(define (domain logistics-strips)
  (:requirements :strips) 
  (:predicates  
    (obj ?o)
  (truck ?t)
    (location ?l)
  (airplane ?a)
    (airport ?airport)
  (in ?o1 ?o2))

(:action l-truck
  :parameters
   (?o
    ?t
    ?l)
  :precondition
   (and (obj ?o) (truck ?t) (location ?l)
   (in ?t ?l) (in ?o ?l))
  :effect
   (and ))

(:action l-airplane
  :parameters
   (?o
    ?a
    ?l)
  :precondition
   (and (obj ?o) (airplane ?a) (location ?l)
   (in ?o ?l) (in ?a ?l))
  :effect
   (and ))

(:action u-truck
  :parameters
   (?o
    ?t
    ?l)
  :precondition
   (and (obj ?o) (truck ?t) (location ?l)
        (in ?t ?l) (in ?o ?t))
  :effect
   (and ))

(:action u-airplane
  :parameters
   (?o
    ?a
    ?l)
  :precondition
   (and (obj ?o) (airplane ?a) (location ?l)
        (in ?o ?a) (in ?a ?l))
  :effect
   (and ))

(:action m-truck
  :parameters
   (?t
    ?l-from
    ?l-to
    ?l)
  :precondition
   (and (truck ?t) (location ?l-from) (location ?l-to) (location ?l)
   (in ?t ?l-from)
   (in ?l-from ?l)
   (in ?l-to ?l))
  :effect
   (and ))

(:action m-airplane
  :parameters
   (?a
    ?l-from
    ?l-to)
  :precondition
   (and (airplane ?a) (airport ?l-from) (airport ?l-to)
  (in ?a ?l-from))
  :effect
   (and ))
)
