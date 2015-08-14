import java.io.*;
class temp {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new FileReader("histogram.js"));
        PrintWriter p = new PrintWriter(new FileWriter("test.js"));
        for (int v = 1; v <= 185; v++) {
            String s = br.readLine();
            System.out.println(s);
            if (v < 23) p.println(s); 
            else {
                p.println('\t' + s);
            }
        }
        p.close();
    }
}
