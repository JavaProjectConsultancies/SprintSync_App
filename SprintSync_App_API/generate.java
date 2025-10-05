import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class generate-real-bcrypt {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("Real BCrypt hashes:");
        System.out.println();
        
        System.out.println("admin123 -> " + encoder.encode("admin123"));
        System.out.println("manager123 -> " + encoder.encode("manager123"));
        System.out.println("dev123 -> " + encoder.encode("dev123"));
        System.out.println("design123 -> " + encoder.encode("design123"));
        
        System.out.println();
        System.out.println("SQL UPDATE statements:");
        System.out.println();
        
        String adminHash = encoder.encode("admin123");
        String managerHash = encoder.encode("manager123");
        String devHash = encoder.encode("dev123");
        String designHash = encoder.encode("design123");
        
        System.out.println("UPDATE users SET password_hash = '" + adminHash + "' WHERE email = 'admin@sprintsync.com';");
        System.out.println("UPDATE users SET password_hash = '" + managerHash + "' WHERE role = 'manager';");
        System.out.println("UPDATE users SET password_hash = '" + devHash + "' WHERE role = 'developer';");
        System.out.println("UPDATE users SET password_hash = '" + designHash + "' WHERE role = 'designer';");
    }
}
