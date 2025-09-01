package com.example.security.service;

import com.example.security.clientApi.CakeClient;
import com.example.security.model.Cake;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CakeService {
    @Autowired
    private CakeClient cakeClient;

    public Cake getCake(String cake) {

        return cakeClient.getCake(cake);
    }
    public Cake getCakeById(int id) {
        return cakeClient.getCakeById(id);
    }
    public String addCake(Cake cake) {

        return cakeClient.createCake(cake);
    }
    public List<Cake> getAllCakes() {return cakeClient.getAllCakes(); }

    public String deleteCake(String cake) {
        return cakeClient.deleteCake(cake);
    }
    public String updateCake(Cake cake) {
        if (cakeClient.getCake(cake.getName()) == null) {
            return "Cake does not exist";
        }
        return cakeClient.updateCake(cake);
    }
}
