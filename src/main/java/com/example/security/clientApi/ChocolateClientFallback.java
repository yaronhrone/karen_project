package com.example.security.clientApi;

import com.example.security.model.Chocolate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ChocolateClientFallback implements ChocolateClient {
    @Override
    public Chocolate getChocolate(String name) {
        return null;
    }
    @Override
    public String createChocolate(Chocolate chocolate) {
        return "Fallback cold not create";
    }

    @Override
    public String deleteChocolate(String name) {
        return "";
    }

    @Override
    public String updateChocolate(Chocolate chocolate) {
        return "";
    }

    @Override
    public List<Chocolate> getAllChocolates() {
        return List.of();
    }

    @Override
    public Chocolate getChocolateById(int id) {
        return null;
    }

}
