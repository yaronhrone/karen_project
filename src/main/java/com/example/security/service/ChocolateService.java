package com.example.security.service;

import com.example.security.clientApi.ChocolateClient;
import com.example.security.model.Chocolate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
    public String deleteChocolate(String name) {
        if (chocolateClient.getChocolate(name) != null) {
        return chocolateClient.deleteChocolate(name);
    } return "Chocolate not found";
    }
    public String updateChocolate(Chocolate chocolate) {
        if (chocolateClient.getChocolate(chocolate.getName()) != null) {
        return chocolateClient.updateChocolate(chocolate);
    }
        return "Chocolate not found";
    }
    public List<Chocolate> getAllChocolates() {return chocolateClient.getAllChocolates(); }
}
