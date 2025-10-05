import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerateBCrypt {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("Generating BCrypt hashes:");
        System.out.println();
        
        String adminHash = encoder.encode("admin123");
        String managerHash = encoder.encode("manager123");
        String devHash = encoder.encode("dev123");
        String designHash = encoder.encode("design123");
        
        System.out.println("admin123 -> " + adminHash);
        System.out.println("manager123 -> " + managerHash);
        System.out.println("dev123 -> " + devHash);
        System.out.println("design123 -> " + designHash);
        
        System.out.println();
        System.out.println("SQL UPDATE statements:");
        System.out.println();
        
        System.out.println("UPDATE users SET password_hash = '" + adminHash + "' WHERE email = 'admin@sprintsync.com';");
        System.out.println("UPDATE users SET password_hash = '" + managerHash + "' WHERE role = 'manager';");
        System.out.println("UPDATE users SET password_hash = '" + devHash + "' WHERE role = 'developer';");
        System.out.println("UPDATE users SET password_hash = '" + designHash + "' WHERE role = 'designer';");
    }
}
