package com.example.security.service;

import com.example.security.clientApi.ChocolateClient;
import com.example.security.model.Chocolate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChocolateService  {

    @Autowired
    private ChocolateClient chocolateClient;



    public Chocolate getChocolate(String name) {
        return chocolateClient.getChocolate(name);

    }


    public String createChocolate(Chocolate chocolate) {
        if (chocolateClient.getChocolate(chocolate.getName()) != null) {
            return "Chocolate already exists";
        }
       String result = chocolateClient.createChocolate(chocolate);
        return "Chocolate created " + result;
    }
}
