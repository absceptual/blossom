import java.util.*;
import java.io.*;
import java.math.*;
import java.time.*;
import java.time.format.*;

import static java.lang.System.out;

class Solution {
    Scanner in;
    void solve() {
        int sum = 0;
        while (in.hasNextInt()) {
            sum += in.nextInt();
        }

        System.ln(sum);
    }
}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        solution.in = new Scanner(System.in);
        solution.solve();
    }
}