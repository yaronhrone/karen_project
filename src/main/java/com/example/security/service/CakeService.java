package com.example.security.service;

import com.example.security.clientApi.CakeClient;
import com.example.security.model.Cake;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CakeService {
    @Autowired
    private CakeClient cakeClient;

    public Cake getCake(String cake) {

        return cakeClient.getCake(cake);
    }
    public String addCake(Cake cake) {

        return cakeClient.createCake(cake);
    }
}
