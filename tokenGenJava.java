import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.GetObjectRequest;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStreamReader;
import java.util.Map;

public class GenerateJWT implements RequestHandler<Map<String,Object>, String> {

    private final AmazonS3 s3 = AmazonS3ClientBuilder.defaultClient();

    @Override
    public String handleRequest(Map<String,Object> event, Context context) {
        String userId = (String) event.get("userId");
        String serviceName = (String) event.get("serviceName");
        String keystorePassword = System.getenv("KEYSTORE_PASSWORD"); // Assuming you set this environment variable

        try {
            // Retrieve keystore file from S3
            S3Object object = s3.getObject(new GetObjectRequest("your-s3-bucket-name", "your-keystore-file-name"));
            BufferedReader reader = new BufferedReader(new InputStreamReader(object.getObjectContent()));
            StringBuilder keystoreContent = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                keystoreContent.append(line);
            }

            // Generate JWT token
            String token = Jwts.builder()
                    .setSubject(userId)
                    .claim("serviceName", serviceName)
                    .signWith(SignatureAlgorithm.HS256, keystoreContent.toString())
                    .compact();

            return token;
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            return "Internal Server Error";
        }
    }
}
