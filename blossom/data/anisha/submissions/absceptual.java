/*
 * UIL Computer Science 2025
 * Invitational A Packet Solution
 */

import java.io.*;
import static java.lang.System.*;
import java.util.*;
public class Main {
	public static void main(String[]args)throws Exception{
		new Main().run();
	}
	
	public void run()throws Exception{
		Scanner file = new Scanner(new File("anisha.dat"));
		int times = file.nextInt();
		file.nextLine();
		while(times-- > 0) {
			int cur = file.nextInt();
			file.nextLine();
			if(cur < 15)
				out.println("On my way to Dehydration Station.");
			else
				out.println("Way to go, H2O.");
		}
		file.close();
	}
}
