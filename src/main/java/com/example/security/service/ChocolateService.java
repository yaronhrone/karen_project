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
    public Chocolate getChocolateById(int id) {
        return chocolateClient.getChocolateById(id);
    }


    public String createChocolate(Chocolate chocolate) {
        try {
            Chocolate existing = chocolateClient.getChocolate(chocolate.getName());
        if (existing != null) {
            return "Chocolate already exists";
        }
        } catch (Exception e) {
            System.out.println(e.getMessage());

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
