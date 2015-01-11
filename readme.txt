
===================================================

Readme - Internet Technologies - 2014/5
Exercise 4

Written By:
    Alon Ben-Shimol, alonbs, 200707701
    Tal Orenstein, orenstal, 301293767

===================================================


q. What was hard in this exercise?
a. The hardest part for us was to understand the new required design and the idea behind it. After overcoming this
   difficulty the solution was almost straightforward.

q. What was fun in this exercise?
a. It was fun to learn how dynamic server is works, and the mechanism to handle client's request from dynamic server.

q. If we were hacker...
a. The two different 'bad' dynamic functions we could use are:
    1. function resourceHandler1(req, res, next) {
          while(true){}
       }

    2. function resourceHandler2(req, res, next) {
          process.exit();
       }

   We would make sure that these handlers will get executed by inserting them before any other resource starts
   with '/hello/hacker' such that they will handle 'any' method type. Then, we would send a request to the server
   in which the path is '/hello/hacker'.
   To ensure that our handler will be the first handler for this resource, we could add unique string to the
   '/hello/hacker' suffix (for example: '/hello/hacker/someUniqueString') and then include this path in the request.