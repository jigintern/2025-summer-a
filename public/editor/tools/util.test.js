import { CharPlace } from "./util.js";
import { assertEquals } from "jsr:@std/assert";

Deno.test(function charPlace() {
    assertEquals(new CharPlace("Hello,_World!", 100).toAA(), "Hello,_World!");
});
